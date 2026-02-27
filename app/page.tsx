"use client";

import { AppProvider } from "@/lib/store";
import { AppRouter } from "@/components/app-router";

export default function Page() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
