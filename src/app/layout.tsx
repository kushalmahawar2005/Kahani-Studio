import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import IntroLoader from "@/components/IntroLoader";
import FloatingActions from "@/components/FloatingActions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kahani Clicks | Premium Photography & Cinematography Studio",
  description:
    "Editorial wedding cinematography and photography from Rajasthan. Capturing stories with timeless elegance and cinematic depth.",
  openGraph: {
    title: "Kahani Clicks | Premium Photography Studio",
    description:
      "Editorial wedding cinematography and photography from Rajasthan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#F9F9EA] text-[#1a1a1a] selection:bg-[#1a1a1a] selection:text-white"
        suppressHydrationWarning
      >
        <IntroLoader />
        <SmoothScroll />
        <ScrollProgress />
        <CustomCursor />
        {children}
        <FloatingActions />
      </body>
    </html>
  );
}
