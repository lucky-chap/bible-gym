"use client";

import { useAppDispatch } from "@/lib/store";
import {
  Flame,
  Target,
  Trophy,
  Users,
  ChevronRight,
  Dumbbell,
  BookOpen,
  Zap,
} from "lucide-react";

export function LandingPage() {
  const dispatch = useAppDispatch();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] dark:from-[#0a0a0a] dark:via-[#1a1a2e] dark:to-[#16213e]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-[100px] animate-pulse" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-40 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Bible Gym
            </span>
          </div>
          <button
            onClick={() => dispatch({ type: "SET_VIEW", payload: "auth" })}
            className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300 hover:border-white/20"
          >
            Sign In
          </button>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 md:pt-32 md:pb-44">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-8">
              <Flame className="w-4 h-4" />
              <span>Spiritual Training System</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
              Train your spirit
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                like an athlete.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl mb-10">
              Structured daily workouts to build Bible knowledge, deepen
              understanding, and grow your faith — one drill at a time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => dispatch({ type: "SET_VIEW", payload: "auth" })}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-300"
              >
                Start Training
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 text-gray-300 font-semibold border border-white/10 hover:bg-white/10 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="relative py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Daily Spiritual Workout
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Three focused drills designed to strengthen different aspects of
              your Scripture knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Memorization Drill",
                desc: "Fill in missing words from key Bible passages. Build muscle memory for Scripture.",
                color: "from-blue-500 to-cyan-500",
                shadowColor: "shadow-blue-500/20",
                bgGlow: "bg-blue-500/5",
              },
              {
                icon: Target,
                title: "Context Challenge",
                desc: "Answer questions about passage context, authorship, and historical background.",
                color: "from-orange-500 to-amber-500",
                shadowColor: "shadow-orange-500/20",
                bgGlow: "bg-orange-500/5",
              },
              {
                icon: Zap,
                title: "Verse Match",
                desc: "Match Bible references with their correct verse text. Test your recall.",
                color: "from-emerald-500 to-green-500",
                shadowColor: "shadow-emerald-500/20",
                bgGlow: "bg-emerald-500/5",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border border-white/5 p-8 ${feature.bgGlow} hover:border-white/10 transition-all duration-500`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-20 bg-gradient-to-b from-[#0d0d0d] to-[#111]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Flame, value: "300", label: "Max Daily Points" },
              { icon: Target, value: "3", label: "Drills Per Day" },
              { icon: Trophy, value: "∞", label: "Streak Potential" },
              { icon: Users, value: "Groups", label: "Team Training" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#111]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="rounded-3xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/10 p-12 md:p-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
              Ready to start
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                your training?
              </span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join Bible Gym and build a consistent Scripture study habit. Your
              daily workout is waiting.
            </p>
            <button
              onClick={() => dispatch({ type: "SET_VIEW", payload: "auth" })}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all duration-300"
            >
              Begin Training
              <Dumbbell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">
              Bible Gym
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Train your spirit. Grow your faith.
          </p>
        </div>
      </footer>
    </div>
  );
}
