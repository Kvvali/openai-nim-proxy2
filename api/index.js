const axios = require('axios');

const NIM_API_BASE = 'https://integrate.api.nvidia.com/v1';
const NIM_API_KEY = process.env.NIM_API_KEY;

const MODEL_MAPPING = {
  'gpt-3.5-turbo': 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
  'gpt-4': 'qwen/qwen3-coder-480b-a35b-instruct',
  'gpt-4-turbo': 'moonshotai/kimi-k2-instruct-0905',
  'gpt-4o': 'deepseek-ai/deepseek-v3.1',
  'claude-3-opus': 'openai/gpt-oss-120b',
  'claude-3-sonnet': 'openai/gpt-oss-20b',
  'gemini-pro': 'qwen/qwen3-next-80b-a3b-thinking'
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });
  if (!NIM_API_KEY) return res.status(500).json({ error: { message: 'NIM_API_KEY not set' } });

  try {
    const { model, messages, temperature, max_tokens } = req.body;

    let nimModel = MODEL_MAPPING[model];
    if (!nimModel) {
      const m = (model || '').toLowerCase();
      if (m.includes('gpt-4') || m.includes('405b')) nimModel = 'meta/llama-3.1-405b-instruct';
      else if (m.includes('claude') || m.includes('70b')) nimModel = 'meta/llama-3.1-70b-instruct';
      else nimModel = 'meta/llama-3.1-8b-instruct';
    }

    const response = await axios.post(`${NIM_API_BASE}/chat/completions`, {
      model: nimModel,
      messages,
      temperature: temperature || 0.6,
      max_tokens: max_tokens || 9024,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${NIM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices: response.data.choices.map(choice => ({
        index: choice.index,
        message: { role: choice.message.role, content: choice.message.content || '' },
        finish_reason: choice.finish_reason
      })),
      usage: response.data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    });

  } catch (error) {
    console.error('Proxy error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: { message: error.response?.data?.detail || error.message || 'Internal server error' }
    });
  }
};
