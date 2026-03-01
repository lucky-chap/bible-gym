"use client";

import { useState } from "react";
import { useAuth } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Dumbbell, ArrowLeft, Mail, User as UserIcon } from "lucide-react";

export function AuthScreen() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <div className="h-full flex items-center justify-center flex-1 w-full px-6 py-12">
      <div className="relative w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-12 h-12 rounded-2xl bg-primary border-2 border-foreground flex items-center justify-center"
            style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
          >
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground ">Bible Gym</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Begin your training
            </p>
          </div>
        </div>

        <div
          className="bg-card rounded-2xl border-2 border-foreground p-8"
          style={{ boxShadow: "6px 6px 0px 0px var(--foreground)" }}
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Sign in to continue
              </h2>
              <p className="text-muted-foreground text-sm">
                Connect with Google to save your progress, track your streak,
                and access premium drills.
              </p>
            </div>

            <button
              onClick={() => login()}
              className="w-full py-4 rounded-full bg-primary text-white font-bold text-base border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
            >
              Sign in with Google
            </button>

            <p className="text-xs text-muted-foreground text-center font-medium mt-6">
              By continuing, you agree to train consistently 💪
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
