"use client";

import { useState } from "react";
import { useAuth } from "@/lib/store";
import { useAppDispatch } from "@/lib/store";
import { Dumbbell, ArrowLeft, Mail, User as UserIcon } from "lucide-react";

export function AuthScreen() {
  const [step, setStep] = useState<"email" | "name">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { login } = useAuth();
  const dispatch = useAppDispatch();

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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => {
            if (step === "name") {
              setStep("email");
            } else {
              dispatch({ type: "SET_VIEW", payload: "landing" });
            }
          }}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Bible Gym</h1>
            <p className="text-sm text-gray-500">Begin your training</p>
          </div>
        </div>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Enter your email
              </h2>
              <p className="text-gray-500 text-sm">
                We&apos;ll send you a magic link to sign in. No passwords
                needed.
              </p>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all text-base"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] transition-all duration-300"
            >
              Continue
            </button>

            <p className="text-xs text-gray-600 text-center">
              By continuing, you agree to train consistently 💪
            </p>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                What should we call you?
              </h2>
              <p className="text-gray-500 text-sm">
                This name will appear on leaderboards and in your training
                profile.
              </p>
            </div>

            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoFocus
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all text-base"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] transition-all duration-300"
            >
              Enter the Gym
            </button>
          </form>
        )}

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${step === "email" ? "w-8 bg-orange-500" : "w-4 bg-gray-700"}`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${step === "name" ? "w-8 bg-orange-500" : "w-4 bg-gray-700"}`}
          />
        </div>
      </div>
    </div>
  );
}
