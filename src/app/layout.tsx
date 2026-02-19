import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_KR, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/app/_shared/providers/AuthProvider";
import { AppBackground } from "@/app/_shared/components/AppBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifKR = Noto_Serif_KR({
  weight: ["400", "700"],
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PerspectiveShift",
  description: "Bridge opinion gaps through structured dialogue",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifKR.variable} ${playfairDisplay.variable} antialiased`}
      >
        <AuthProvider>
          <AppBackground>{children}</AppBackground>
        </AuthProvider>
      </body>
    </html>
  );
}
