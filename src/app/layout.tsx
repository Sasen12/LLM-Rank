import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LLMRank AI - AI Search Visibility Platform",
    template: "%s | LLMRank AI",
  },
  description: "Measure and improve how your brand appears in ChatGPT, Gemini, Claude, Perplexity, and AI search results. The first GEO platform built for B2B SaaS.",
  keywords: ["GEO", "Generative Engine Optimization", "AI visibility", "LLM rankings", "ChatGPT mentions", "brand tracking", "B2B SaaS"],
  openGraph: {
    title: "LLMRank AI - AI Search Visibility Platform",
    description: "Measure and improve how your brand appears in ChatGPT, Gemini, Claude, Perplexity, and AI search results.",
    url: "https://llmrank.ai",
    siteName: "LLMRank AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LLMRank AI - AI Search Visibility Platform",
    description: "Measure and improve how your brand appears in ChatGPT, Gemini, Claude, Perplexity, and AI search results.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${plusJakartaSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
