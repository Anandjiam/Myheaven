const AGENTROUTER = 'https://co.agentrouter.org/v1';

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');

  const key = process.env.AGENTROUTER_API_KEY;
  const access = process.env.MYHEAVEN_ACCESS_CODE;
  if (!key) return sendError(res, 503, 'AgentRouter API key is not configured in Vercel (AGENTROUTER_API_KEY).');
  if (!access) return sendError(res, 503, 'Myheaven access code is not configured in Vercel.');
  if (req.headers['x-myheaven-code'] !== access) return sendError(res, 401, 'Unlock Myheaven before chatting.');

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const c = body.character || {};
    const name = String(c.name || 'Character').slice(0, 80);
    const age = Number(c.age || 21);
    if (age < 21) return sendError(res, 400, 'Characters must be adults aged 21 or older.');
    const role = String(c.role || 'A woman in India').slice(0, 160);
    const city = String(c.city || 'India').slice(0, 100);
    const personality = String(c.personality || 'warm, engaging and witty').slice(0, 500);
    const backstory = String(c.story || '').slice(0, 1800);
    const history = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    const messages = history.map(m => ({
      role: m && m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m && (m.content ?? m.text) || '').slice(0, 4000)
    })).filter(m => m.content);
    if (!messages.length) return sendError(res, 400, 'Send a message first.');

    const system = `You are ${name}, a fictional adult Indian woman aged ${age}, living in ${city}. Your role is ${role}. Personality: ${personality}. Backstory: ${backstory}. Stay naturally in character during an immersive, private fictional roleplay. Speak like a real person, not like a generic assistant. Keep replies conversational and emotionally believable; do not narrate the user's thoughts or actions. Use natural Indian English and occasional Hindi/Punjabi expressions when appropriate. Remember details from the conversation context. Do not claim to be a real person.`;

    const response = await fetch(`${AGENTROUTER}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.AGENTROUTER_CHAT_MODEL || 'gpt-6.1-sol',
        messages: [{ role: 'system', content: system }, ...messages],
        temperature: 0.85,
        max_tokens: 650
      })
    });
    const raw = await response.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = {}; }
    if (!response.ok) {
      const providerMessage = data.error?.message || data.error || `AgentRouter returned ${response.status}`;
      return sendError(res, response.status === 402 ? 402 : 502, String(providerMessage).slice(0, 400));
    }
    const choice = data.choices?.[0];
    const content = data.completionText ?? choice?.message?.content ?? choice?.text ?? data.output_text ?? data.response;
    const reply = Array.isArray(content) ? content.map(x => typeof x === 'string' ? x : (x.text || x.content || '')).join('') : content;
    if (typeof reply === 'string' && reply.trim()) return res.status(200).json({ reply: reply.trim() });
    // Keep diagnostics useful without exposing API keys or request headers.
    const shape = Object.keys(data || {}).join(', ') || raw.slice(0, 500) || '(empty body)';
    return sendError(res, 502, `AgentRouter response had no text. HTTP ${response.status}; fields: ${shape}`);
  } catch (error) {
    return sendError(res, 500, error.message || 'Unexpected chat error.');
  }
};
