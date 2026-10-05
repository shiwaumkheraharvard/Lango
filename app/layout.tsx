import type { Metadata, Viewport } from "next";
import { Caveat, Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { AppNav } from "@/components/nav/AppNav";

const display = Inter_Tight({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-display", display: "swap", weight: ["500", "600", "700", "800"] });
const sans = Inter({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-sans", display: "swap" });
const hand = Caveat({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-hand", display: "swap", weight: ["400", "600"] });

export const metadata: Metadata = {
  title: { default: "Lango — say one thing today", template: "%s · Lango" },
  description: "A short daily lesson in Russian or Spanish: flashcards, a spoken conversation, a grammar rule and a handwritten notebook page, graded. Guided by Polo the polar bear.",
  applicationName: "Lango",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#FF6B1A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${hand.variable}`}>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <div id="main" className="min-h-dvh">
          {children}
        </div>
        <AppNav />
      </body>
    </html>
  );
}
