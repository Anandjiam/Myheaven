module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const expected = process.env.MYHEAVEN_ACCESS_CODE;
  if (!expected) return res.status(503).json({ error: 'Myheaven access code is not configured in Vercel yet.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const provided = typeof body.code === 'string' ? body.code : '';
  if (!provided || provided !== expected) return res.status(401).json({ error: 'That access code did not match. Try again.' });
  return res.status(200).json({ ok: true });
};
