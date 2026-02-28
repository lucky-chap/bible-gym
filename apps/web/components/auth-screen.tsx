"use client";

import { useState } from "react";
import { useAuth } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Dumbbell, ArrowLeft, Mail, User as UserIcon } from "lucide-react";

export function AuthScreen() {
  const [step, setStep] = useState<"email" | "name">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setStep("name");
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name, email);
    }
  };

  return (
    <div className="h-full flex items-center justify-center flex-1 w-full px-6 py-12">
      <div className="relative w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => {
            if (step === "name") {
              setStep("email");
            } else {
              router.push("/");
            }
          }}
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
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Enter your email
                </h2>
                <p className="text-muted-foreground text-sm">
                  We&apos;ll send you a magic link to sign in. No passwords
                  needed.
                </p>
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border-2 border-foreground text-foreground placeholder-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-primary transition-all text-base font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-primary text-white font-bold text-base border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
              >
                Continue
              </button>

              <p className="text-xs text-muted-foreground text-center font-medium">
                By continuing, you agree to train consistently 💪
              </p>
            </form>
          ) : (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  What should we call you?
                </h2>
                <p className="text-muted-foreground text-sm">
                  This name will appear on leaderboards and in your training
                  profile.
                </p>
              </div>

              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  autoFocus
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border-2 border-foreground text-foreground placeholder-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-primary transition-all text-base font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-primary text-white font-bold text-base border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
                style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
              >
                Enter the Gym
              </button>
            </form>
          )}
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div
            className={`h-2 rounded-full transition-all duration-300 border-2 border-foreground ${step === "email" ? "w-10 bg-primary" : "w-5 bg-muted"}`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-300 border-2 border-foreground ${step === "name" ? "w-10 bg-primary" : "w-5 bg-muted"}`}
          />
        </div>
      </div>
    </div>
  );
}
