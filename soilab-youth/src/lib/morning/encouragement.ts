import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import { createFallbackEncouragement } from './core';

const SYSTEM_PROMPT = `너는 고립·은둔청년의 일상 회복을 돕는 따뜻한 응원 도우미다.
상담, 진단, 치료를 하지 않는다.
참여자가 적은 오늘의 작은 약속을 존중하고,
비판이나 비교, 과도한 의욕 강요 없이 쉬운 한국어로 2문장 이내로 답한다.
개인정보나 사적인 경험을 추가로 묻지 않는다.`;

export async function createMorningEncouragement(value: string, aiConsent: boolean) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.MORNING_AI_MODEL;

  if (!aiConsent || !apiKey || !model) {
    return { text: createFallbackEncouragement(value), source: 'approved-fallback' as const };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model,
      max_tokens: 120,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `오늘의 작은 약속: ${value}` }],
    });
    const textBlock = response.content.find((block) => block.type === 'text');
    const text = textBlock?.type === 'text' ? textBlock.text.trim() : '';

    if (!text) throw new Error('empty response');
    return { text: text.slice(0, 240), source: 'ai' as const };
  } catch {
    return { text: createFallbackEncouragement(value), source: 'approved-fallback' as const };
  }
}
