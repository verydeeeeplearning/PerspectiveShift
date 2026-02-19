"use client";

import { TopAppBar } from "@/app/_shared/components/TopAppBar";

export default function FunnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TopAppBar variant="immersive" />
      <main className="pt-14 px-4 py-8">{children}</main>
    </div>
  );
}
