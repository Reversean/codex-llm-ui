import dotenv from "dotenv";

dotenv.config({ path: '../.env' })

const LLM_API_URL = process.env['LLM_API_URL'];
const LLM_API_TOKEN = process.env['LLM_API_TOKEN'];

interface LLMGenerateResponse {
  text: string;
}

export async function generateLLMResponse(
  prompt: string
): Promise<LLMGenerateResponse> {
  const res = await fetch(`${LLM_API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LLM_API_TOKEN || '',
    },
    body: JSON.stringify({prompt}),
  })
  return res.json();
}
