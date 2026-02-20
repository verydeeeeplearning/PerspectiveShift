import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

async function testModel(client: OpenAI, model: string, useMaxTokens: boolean) {
  try {
    const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages: [
        { role: "system", content: "한국어로 한 문장만 답하세요." },
        { role: "user", content: "안녕하세요?" },
      ],
    };
    if (useMaxTokens) {
      params.max_tokens = 64;
    }

    const response = await client.chat.completions.create(params);
    const choice = response.choices[0];
    return {
      model,
      useMaxTokens,
      status: "ok",
      actualModel: response.model,
      finishReason: choice?.finish_reason,
      content: choice?.message?.content,
    };
  } catch (error) {
    return {
      model,
      useMaxTokens,
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const hasKey = apiKey && !apiKey.includes("your-") && apiKey.length > 20;

  if (!hasKey) {
    return NextResponse.json({
      status: "no_key",
      message: "OPENAI_API_KEY is missing or placeholder",
    });
  }

  const client = new OpenAI({ apiKey });

  // Test multiple configurations to find what works
  const results = await Promise.all([
    testModel(client, "gpt-5-mini", false),
    testModel(client, "gpt-5-mini", true),
    testModel(client, "gpt-4o-mini", false),
    testModel(client, "gpt-4o-mini", true),
  ]);

  return NextResponse.json({ results });
}
