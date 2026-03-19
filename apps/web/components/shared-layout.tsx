"use client";

import { useAppState, useAppDispatch } from "@/lib/store";
import { Users, BookOpen, ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { UserButton, SignInButton, SignUpButton, Show } from "@clerk/nextjs";

export function SharedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAppState();
  const dispatch = useAppDispatch();
  const pathname = usePathname() || "/";
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-5">
          <div
            className="w-16 h-16 rounded-2xl bg-primary border-2 border-foreground flex items-center justify-center mx-auto animate-stamp"
            style={{ boxShadow: "var(--shadow-brutal-lg)" }}
          >
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-black text-foreground uppercase tracking-widest">
              Word Mastery
            </div>
            <div className="text-xs text-muted-foreground font-bold">
              Preparing your training...
            </div>
          </div>
          <div className="w-32 h-1.5 mx-auto rounded-full bg-secondary border border-foreground/10 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full animate-pulse"
              style={{ width: "60%" }}
            />
          </div>
        </div>
      </div>
    );
  }

  const renderHeader = () => {
    if (
      pathname === "/workout" ||
      pathname === "/practice" ||
      pathname === "/auth" ||
      pathname === "/workout-complete"
    ) {
      return null;
    }

    return (
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-foreground">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {pathname === "/group" ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          ) : (
            <button
              onClick={() =>
                router.push(pathname === "/dashboard" ? "/dashboard" : "/")
              }
              className="flex items-center gap-2.5 group"
            >
              <div
                className="w-9 h-9 rounded-lg bg-primary border-2 border-foreground flex items-center justify-center group-hover:translate-y-[-1px] transition-transform"
                style={{ boxShadow: "var(--shadow-brutal-sm)" }}
              >
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-base font-black text-foreground tracking-tight leading-none">
                  Word Mastery
                </span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] leading-none mt-0.5">
                  Scripture Forge
                </span>
              </div>
            </button>
          )}

          {pathname === "/group" && (
            <h1 className="text-base font-black text-foreground uppercase tracking-wide">
              Training Groups
            </h1>
          )}

          <div className="flex items-center gap-2.5">
            {pathname === "/" && (
              <Show when="signed-out">
                <div className="flex items-center gap-2.5">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 rounded-lg bg-background text-foreground text-sm font-bold border-2 border-foreground btn-brutal">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold border-2 border-foreground btn-brutal">
                      Start Training
                    </button>
                  </SignUpButton>
                </div>
              </Show>
            )}

            <Show when="signed-in">
              <div className="flex items-center gap-3">
                {pathname === "/dashboard" && (
                  <button
                    onClick={() => router.push("/group")}
                    className="w-9 h-9 rounded-lg bg-card border-2 border-foreground flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    style={{ boxShadow: "var(--shadow-brutal-sm)" }}
                  >
                    <Users className="w-5 h-5" />
                  </button>
                )}
                <UserButton />
              </div>
            </Show>

            {pathname === "/group" && <div className="w-20" />}
          </div>
        </div>
      </header>
    );
  };

  const renderFooter = () => {
    if (!["/", "/dashboard", "/group"].includes(pathname)) return null;

    return (
      <footer className="bg-iron py-8 border-t-2 border-foreground mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary border border-primary-foreground/20 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-black text-primary-foreground tracking-tight">
              Word Mastery
            </span>
          </div>
          <p className="text-[11px] text-primary-foreground/40 font-bold uppercase tracking-wider">
            Train your spirit · Grow your faith
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
