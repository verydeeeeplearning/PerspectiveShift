import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") ?? "ALIAS";
  const alias = searchParams.get("alias") ?? "PerspectiveShift";
  const emoji = searchParams.get("emoji") ?? "🧭";
  const description =
    searchParams.get("description") ?? "나만의 관점을 발견하세요";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            borderRadius: "24px",
            padding: "48px 64px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            maxWidth: "900px",
          }}
        >
          <span style={{ fontSize: "80px", lineHeight: 1 }}>{emoji}</span>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              color: "#111827",
              marginTop: "16px",
              textAlign: "center",
            }}
          >
            {alias}
          </h1>
          <p
            style={{
              fontSize: "20px",
              color: "#6B7280",
              marginTop: "8px",
              textAlign: "center",
              maxWidth: "600px",
            }}
          >
            {description}
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "#9CA3AF",
              marginTop: "24px",
              textAlign: "center",
            }}
          >
            PerspectiveShift
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
