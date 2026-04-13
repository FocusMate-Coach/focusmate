import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const SYSTEM_PROMPT =
  '당신은 학습 패턴 분석 전문 AI 코치입니다. 학생의 학습 데이터를 분석하여 구체적이고 실행 가능한 피드백을 제공합니다. 데이터에 기반한 정확한 인사이트와 친근한 격려 메시지를 함께 제공해 주세요.';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 서버에 설정되지 않았습니다.' });
  }

  const { prompt } = req.body as { prompt: string };
  if (!prompt) {
    return res.status(400).json({ error: '프롬프트가 없습니다.' });
  }

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    const text = response.choices[0].message.content ?? '';
    return res.status(200).json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return res.status(500).json({ error: `AI 분석 중 오류가 발생했습니다: ${message}` });
  }
}
