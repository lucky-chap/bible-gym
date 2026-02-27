import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bible Gym — Train Your Spirit Like an Athlete",
  description:
    "A gamified Bible study platform with daily spiritual workouts. Memorization drills, context challenges, and verse matching — structured training for Scripture mastery.",
  keywords: [
    "Bible study",
    "spiritual training",
    "Bible memorization",
    "Scripture workout",
    "gamified Bible",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased bg-[#0a0a0a] text-white">
        {children}
      </body>
    </html>
  );
}
