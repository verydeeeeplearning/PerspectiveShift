"use client";

import { TopAppBar } from "@/app/_shared/components/TopAppBar";
import { BottomTabBar } from "@/app/_shared/components/BottomTabBar";
import { PageTransition } from "@/app/_shared/components/PageTransition";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TopAppBar variant="wordmark" />
      <main className="pt-14 pb-20 px-4">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomTabBar />
    </div>
  );
}
