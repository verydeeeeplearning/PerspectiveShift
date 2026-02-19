import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { requireAuthUserId } from "@/infrastructure/config/auth-session";
import { ClaimSessionInputSchema } from "@/application/dtos/auth-input";
import { handleError } from "../../_shared/error-handler";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuthUserId();
    const body = await request.json();
    const input = ClaimSessionInputSchema.parse(body);

    const container = getContainer();
    const result = await container.claimSessionUseCase.execute(
      userId,
      input.sessionId,
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
