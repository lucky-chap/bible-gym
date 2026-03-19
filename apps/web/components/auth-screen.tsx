"use client";

import { useAuth } from "@/lib/store";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";

export function AuthScreen() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <div className="h-full flex items-center justify-center flex-1 w-full px-6 py-12 relative">
      {/* Background texture */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-xl bg-primary border-2 border-foreground flex items-center justify-center"
            style={{ boxShadow: "var(--shadow-brutal-sm)" }}
          >
            <BookOpen className="w-5.5 h-5.5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">
              Word Mastery
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Begin your training
            </p>
          </div>
        </div>

        <div
          className="bg-card rounded-xl border-2 border-foreground p-7"
          style={{ boxShadow: "var(--shadow-brutal-lg)" }}
        >
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-foreground mb-2 tracking-tight">
                Sign in to continue
              </h2>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                Connect with Google to save your progress, track your streak,
                and join training groups.
              </p>
            </div>

            {/* Divider */}
            <div className="divider-cross" />

            <button
              onClick={() => login()}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black text-base border-2 border-foreground btn-brutal uppercase tracking-wide"
            >
              Sign in with Google
            </button>

            <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-wider">
              By continuing, you agree to train consistently
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
