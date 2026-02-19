"use client";

import { TopAppBar } from "@/app/_shared/components/TopAppBar";
import { BottomTabBar } from "@/app/_shared/components/BottomTabBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <TopAppBar variant="wordmark" />
      <main className="pt-14 pb-20 px-4">{children}</main>
      <BottomTabBar />
    </div>
  );
}
