import { NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { handleError } from "../_shared/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const container = getContainer();
    const result =
      await container.updateReceptivenessUseCase.getWithPercentile(userId);

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
