import { NextResponse, type NextRequest } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";
import { requireAuthUserId } from "@/infrastructure/config/auth-session";
import { BlockUserInputSchema } from "@/application/dtos/safety-input";
import { handleError } from "../../_shared/error-handler";

export async function POST(request: NextRequest) {
  try {
    if (process.env.FEATURE_RELATIONSHIP !== "true") {
      return NextResponse.json(
        { error: "Feature disabled" },
        { status: 404 },
      );
    }

    const userId = await requireAuthUserId();
    const body = await request.json();
    const input = BlockUserInputSchema.parse(body);

    const container = getContainer();
    await container.blockUserUseCase.execute(
      userId,
      input.blockedId,
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (process.env.FEATURE_RELATIONSHIP !== "true") {
      return NextResponse.json(
        { error: "Feature disabled" },
        { status: 404 },
      );
    }

    const userId = await requireAuthUserId();
    const body = await request.json();
    const input = BlockUserInputSchema.parse(body);

    const container = getContainer();
    await container.unblockUserUseCase.execute(
      userId,
      input.blockedId,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
