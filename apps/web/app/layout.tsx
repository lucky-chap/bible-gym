import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { SharedLayout } from "@/components/shared-layout";

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
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AppProvider>
          <SharedLayout>{children}</SharedLayout>
        </AppProvider>
      </body>
    </html>
  );
}
