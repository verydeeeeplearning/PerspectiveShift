import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/app/_shared/providers/AuthProvider";
import { AppBackground } from "@/app/_shared/components/AppBackground";
import { ServiceWorkerRegister } from "@/app/_shared/components/ServiceWorkerRegister";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PerspectiveShift",
  description: "Bridge opinion gaps through structured dialogue",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard (Korean sans-serif body font) */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Playfair Display + Noto Serif KR (heading Serif fonts via Google Fonts CDN) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&family=Playfair+Display:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a2e" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-body`}
      >
        <AuthProvider>
          <ServiceWorkerRegister />
          <AppBackground>
            {children}
          </AppBackground>
        </AuthProvider>
      </body>
    </html>
  );
}
