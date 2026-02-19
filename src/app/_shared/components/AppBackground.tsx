import type { ReactNode } from "react";

export type AppBackgroundVariant = "paper" | "paperWarm" | "paperVignette";

interface AppBackgroundProps {
  variant?: AppBackgroundVariant;
  children: ReactNode;
}

const BG_CLASS: Record<AppBackgroundVariant, string> = {
  paper: "bg-paper",
  paperWarm: "bg-paper-warm",
  paperVignette: "bg-paper",
};

export function AppBackground({
  variant = "paper",
  children,
}: AppBackgroundProps) {
  return (
    <div className={`min-h-screen ${BG_CLASS[variant]} relative`}>
      {/* Grain noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] bg-repeat z-0"
        style={{ backgroundImage: "url('/textures/noise.svg')" }}
        aria-hidden="true"
      />

      {/* Vignette overlay (paperVignette only) */}
      {variant === "paperVignette" && (
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(44,62,80,0.12) 100%)",
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
