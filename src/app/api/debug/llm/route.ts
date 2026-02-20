import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

interface TestResult {
  label: string;
  status: string;
  model?: string;
  content?: string | null;
  finishReason?: string;
  error?: string;
}

async function runTest(
  client: OpenAI,
  label: string,
  params: OpenAI.ChatCompletionCreateParamsNonStreaming,
): Promise<TestResult> {
  try {
    const response = await client.chat.completions.create(params);
    return {
      label,
      status: "ok",
      model: response.model,
      content: response.choices[0]?.message?.content,
      finishReason: response.choices[0]?.finish_reason,
    };
  } catch (error) {
    return {
      label,
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const hasKey = apiKey && !apiKey.includes("your-") && apiKey.length > 20;

  if (!hasKey) {
    return NextResponse.json({ status: "no_key" });
  }

  const client = new OpenAI({ apiKey });
  const msgs: OpenAI.ChatCompletionCreateParamsNonStreaming["messages"] = [
    { role: "system", content: "한국어로 한 문장만 답하세요." },
    { role: "user", content: "안녕하세요?" },
  ];

  const results = await Promise.all([
    runTest(client, "gpt5mini-no-limit", {
      model: "gpt-5-mini", messages: msgs,
    }),
    runTest(client, "gpt5mini-max_completion_tokens", {
      model: "gpt-5-mini", messages: msgs, max_completion_tokens: 256,
    }),
    runTest(client, "gpt5mini-max_tokens", {
      model: "gpt-5-mini", messages: msgs, max_tokens: 256,
    }),
    runTest(client, "gpt5mini-temp0.8-persona", {
      model: "gpt-5-mini",
      temperature: 0.8,
      max_completion_tokens: 1024,
      messages: [
        { role: "system", content: "당신은 현실주의 직장인입니다. 30대 IT직군이며, 경제 보수 성향입니다. 시장 효율성과 개인 노력을 중시합니다. 한국어 존댓말로 1-3문장 답하세요." },
        { role: "user", content: '상대방: "저는 이 정책이 장기적으로 더 많은 사람에게 도움이 된다고 봅니다."\n\n위 발언에 나의 관점에서 답하세요.' },
      ],
    }),
  ]);

  return NextResponse.json({ results });
}
