"use client";

import { TopAppBar } from "@/app/_shared/components/TopAppBar";
import { PageTransition } from "@/app/_shared/components/PageTransition";

export default function FunnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TopAppBar variant="immersive" />
      <main className="pt-14 px-4 py-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
