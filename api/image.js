const VENICE = 'https://api.venice.ai/api/v1';
const BUILT_IN = new Set(['sonam', 'simar', 'rupinder', 'jassi', 'meher', 'zoya']);

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  const key = process.env.VENICE_API_KEY;
  const access = process.env.MYHEAVEN_ACCESS_CODE;
  if (!key) return sendError(res, 503, 'Venice API key is not configured in Vercel.');
  if (!access) return sendError(res, 503, 'Myheaven access code is not configured in Vercel.');
  if (req.headers['x-myheaven-code'] !== access) return sendError(res, 401, 'Unlock Myheaven before generating pictures.');

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const c = body.character || {};
    const id = String(c.id || '');
    const name = String(c.name || 'Character').slice(0, 80);
    const age = Number(c.age || 21);
    const prompt = String(body.prompt || '').trim().slice(0, 900);
    if (age < 21) return sendError(res, 400, 'Characters must be adults aged 21 or older.');
    if (!prompt) return sendError(res, 400, 'Describe the scene first.');

    let portraitUrl;
    if (BUILT_IN.has(id)) {
      const host = String(req.headers.host || process.env.VERCEL_URL || 'myheaven-indol.vercel.app').replace(/^https?:\/\//, '');
      portraitUrl = `https://${host}/portrait-${id}.webp`;
    } else {
      portraitUrl = String(body.portraitUrl || '');
      if (!portraitUrl.startsWith('https://')) return sendError(res, 400, 'This custom character needs a portrait image URL beginning with https://');
    }

    const characterNotes = String(c.story || '').slice(0, 1000);
    const editPrompt = `Use the supplied portrait as the identity reference for the same fictional adult woman, ${name}, age ${age}. Preserve her recognizable face and facial proportions, skin tone, eye shape, nose, mouth and hair identity as closely as the model can. Do not substitute a different woman. Change only the scene, pose, clothing, camera framing and background as requested. Scene: ${prompt}. Character background: ${characterNotes}. Photorealistic, natural anatomy, coherent lighting, candid cinematic photography.`;

    const response = await fetch(`${VENICE}/image/edit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.VENICE_IMAGE_EDIT_MODEL || 'qwen-edit-uncensored',
        image: portraitUrl,
        prompt: editPrompt,
        aspect_ratio: 'auto',
        resolution: '1K',
        output_format: 'webp',
        safe_mode: false
      })
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      return sendError(res, response.status === 402 ? 402 : 502, detail || `Venice image edit returned ${response.status}`);
    }
    const type = response.headers.get('content-type') || 'image/webp';
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) return sendError(res, 502, 'Venice returned an empty image.');
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Disposition', 'inline; filename="myheaven-image.webp"');
    return res.status(200).send(bytes);
  } catch (error) {
    return sendError(res, 500, error.message || 'Unexpected image generation error.');
  }
};
