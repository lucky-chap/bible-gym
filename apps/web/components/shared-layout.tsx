"use client";

import { useAppState, useAppDispatch } from "@/lib/store";
import { Dumbbell, Users, LogOut, ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export function SharedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAppState();
  const dispatch = useAppDispatch();
  const pathname = usePathname() || "/";
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl bg-primary border-2 border-foreground flex items-center justify-center mx-auto animate-pulse"
            style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
          >
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <div className="text-sm text-muted-foreground font-bold">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  const renderHeader = () => {
    // Workout and Practice flows keep their specialized headers in their components
    if (
      pathname === "/workout" ||
      pathname === "/practice" ||
      pathname === "/auth" ||
      pathname === "/workout-complete"
    ) {
      return null;
    }

    return (
      <header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {pathname === "/group" ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl bg-primary border-2 border-foreground flex items-center justify-center"
                style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
              >
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                Bible Gym
              </span>
            </div>
          )}

          {pathname === "/group" && (
            <h1 className="text-lg font-black text-foreground">
              Training Groups
            </h1>
          )}

          <div className="flex items-center gap-3">
            {pathname === "/" && (
              <>
                <button
                  onClick={() => router.push("/auth")}
                  className="px-5 py-2.5 rounded-full bg-background text-foreground text-sm font-bold border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                  style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/auth")}
                  className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                  style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
                >
                  Start Training
                </button>
              </>
            )}

            {pathname === "/dashboard" && (
              <>
                <button
                  onClick={() => router.push("/group")}
                  className="w-10 h-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center text-foreground hover:bg-primary hover:text-white transition-all"
                  style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
                >
                  <Users className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: "LOGOUT" });
                    localStorage.removeItem("bible-gym-state");
                    router.push("/");
                  }}
                  className="w-10 h-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-700 transition-all"
                  style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}

            {pathname === "/group" && <div className="w-20" />}
          </div>
        </div>
      </header>
    );
  };

  const renderFooter = () => {
    if (!["/", "/dashboard", "/group"].includes(pathname)) return null;

    return (
      <footer className="bg-foreground py-10 border-t-2 border-foreground mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary border-2 border-white/20 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Bible Gym</span>
          </div>
          <p className="text-xs text-gray-400">
            Train your spirit. Grow your faith.
          </p>
        </div>
      </footer>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {renderHeader()}
      <main className="flex-1">{children}</main>
      {renderFooter()}
    </div>
  );
}
