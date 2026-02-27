// api/models.js - List available models
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const models = [
    'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo',
    'gpt-4o', 'claude-3-opus', 'claude-3-sonnet', 'gemini-pro'
  ].map(id => ({ id, object: 'model', created: Date.now(), owned_by: 'nvidia-nim-proxy' }));

  res.status(200).json({ object: 'list', data: models });
}
