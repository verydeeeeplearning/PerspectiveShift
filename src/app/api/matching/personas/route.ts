import { NextResponse } from "next/server";
import { getContainer } from "@/infrastructure/config/di-container";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const container = getContainer();
    const personas = await container.personaRepository.findAll();

    return NextResponse.json({
      personas: personas.map((p) => ({
        id: p.id,
        name: p.name,
        ageGroup: p.ageGroup,
        jobCategory: p.jobCategory,
        stanceLabel: p.stanceLabel,
        description: p.description,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load personas" },
      { status: 500 },
    );
  }
}
