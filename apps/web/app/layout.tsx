import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { AppProvider } from "@/lib/store/context";
import { SharedLayout } from "@/components/shared-layout";
import { ConvexClientProvider } from "@/components/providers/convex-provider";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Word Mastery — Train Your Spirit Like an Athlete",
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
    <ClerkProvider>
      <html
        suppressHydrationWarning
        lang="en"
        className={`${bricolage.variable} ${dmSans.variable}`}
      >
        <body className="font-sans antialiased bg-background text-foreground">
          <ConvexClientProvider>
            <AppProvider>
              <SharedLayout>{children}</SharedLayout>
            </AppProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
