import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  const hasKey = apiKey && !apiKey.includes("your-") && apiKey.length > 20;

  if (!hasKey) {
    return NextResponse.json({
      status: "no_key",
      message: "OPENAI_API_KEY is missing or placeholder",
    });
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      max_tokens: 128,
      messages: [
        { role: "system", content: "한국어로 한 문장만 답하세요." },
        { role: "user", content: "안녕하세요, 테스트입니다. 짧게 답해주세요." },
      ],
    });

    const choice = response.choices[0];
    return NextResponse.json({
      status: "ok",
      model: response.model,
      finishReason: choice?.finish_reason,
      content: choice?.message?.content,
      hasContent: !!choice?.message?.content,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
