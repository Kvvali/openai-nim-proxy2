// api/health.js - Health check
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ status: 'ok', service: 'OpenAI to NVIDIA NIM Proxy (Vercel)' });
}
