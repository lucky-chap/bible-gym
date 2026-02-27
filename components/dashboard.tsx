"use client";

import {
  useAppState,
  useAppDispatch,
  useWorkout,
  usePractice,
} from "@/lib/store";
import {
  Flame,
  Trophy,
  Users,
  Dumbbell,
  ChevronRight,
  Calendar,
  Target,
  LogOut,
  Zap,
  Crown,
  PlayCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  generateRandomAIDrill,
  generateThemedWorkout,
} from "@/app/actions/generate-drills";
import { useState } from "react";

export function Dashboard() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { startWorkout, startGroupChallenge } = useWorkout();
  const { startPractice } = usePractice();
  const user = state.user;
  const [isStartingDaily, setIsStartingDaily] = useState(false);
  const [aiTheme, setAiTheme] = useState("");
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);

  if (!user) return null;

  const today = new Date().toISOString().split("T")[0];
  const hasCompletedToday = user.lastWorkoutDate === today;

  const userGroupRank = state.groupMembers.findIndex(
    (m) => m.userId === user.id,
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Bible Gym
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: "SET_VIEW", payload: "group" })}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                dispatch({ type: "LOGOUT" });
                localStorage.removeItem("bible-gym-state");
              }}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              {user.name.split(" ")[0]}
            </span>
          </h1>
          <p className="text-gray-500 mt-1">
            {hasCompletedToday
              ? "Great work today! Come back tomorrow for your next session."
              : "Your daily workout is ready. Let's train."}
          </p>
        </div>

        {/* Start Workout CTA */}
        <button
          onClick={async () => {
            if (!hasCompletedToday) {
              setIsStartingDaily(true);
              try {
                const aiDrill = await generateRandomAIDrill();
                await startWorkout(aiDrill);
              } catch (error) {
                console.error("Failed to start daily workout with AI:", error);
                await startWorkout(); // Fallback to normal
              } finally {
                setIsStartingDaily(false);
              }
            }
          }}
          disabled={hasCompletedToday || isStartingDaily}
          className={`group w-full relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-500 ${
            hasCompletedToday
              ? "bg-emerald-500/5 border-2 border-emerald-500/20 cursor-default"
              : "bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-2 border-orange-500/20 hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer"
          }`}
        >
          {!hasCompletedToday && (
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 group-hover:translate-x-full transition-transform duration-1000" />
          )}
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {hasCompletedToday ? (
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    ✓ Completed
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold animate-pulse">
                    Ready
                  </div>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                {hasCompletedToday
                  ? "Today's Workout Complete"
                  : "Start Today's Workout"}
              </h2>
              <p className="text-gray-500 text-sm">
                {hasCompletedToday
                  ? "You've earned your rest. See you tomorrow."
                  : "3 drills · ~5 min · 300 pts max"}
              </p>
            </div>
            {!hasCompletedToday && (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform">
                {isStartingDaily ? (
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                ) : (
                  <ChevronRight className="w-7 h-7 text-white" />
                )}
              </div>
            )}
          </div>
        </button>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 text-center hover:border-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {user.streak}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              Day Streak
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 text-center hover:border-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">
              {user.totalScore.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              Total Points
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 text-center hover:border-white/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
              {user.groupId ? (
                <Crown className="w-5 h-5 text-cyan-400" />
              ) : (
                <Users className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <div className="text-2xl font-extrabold text-white">
              {user.groupId
                ? userGroupRank >= 0
                  ? `#${userGroupRank + 1}`
                  : "-"
                : "-"}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              {user.groupId ? "Group Rank" : "No Group"}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </h3>

          <button
            onClick={() => dispatch({ type: "SET_VIEW", payload: "group" })}
            className="w-full flex items-center gap-4 rounded-2xl bg-white/[0.03] border border-white/5 p-5 hover:border-white/10 hover:bg-white/[0.05] transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">Training Groups</div>
              <div className="text-sm text-gray-500">
                {user.groupId
                  ? "View your group leaderboard"
                  : "Join or create a group"}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
          </button>

          <div className="flex items-center gap-4 rounded-2xl bg-white/[0.03] border border-white/5 p-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">Training History</div>
              <div className="text-sm text-gray-500">
                {user.lastWorkoutDate
                  ? `Last trained: ${new Date(user.lastWorkoutDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
                  : "No sessions yet"}
              </div>
            </div>
          </div>
        </div>

        {/* Workout Breakdown Preview */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Quick Training</h3>
            <span className="text-xs text-orange-400 font-medium bg-orange-500/10 px-2 py-1 rounded-md">
              Unlimited
            </span>
          </div>
          <div className="space-y-4">
            {/* AI Generator Option */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/5 border border-blue-500/20 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    AI Theme Generator
                  </div>
                  <div className="text-xs text-gray-500">
                    Custom workout by theme
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiTheme}
                  onChange={(e) => setAiTheme(e.target.value)}
                  placeholder="Them (e.g. Love, Hope)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <button
                  onClick={async () => {
                    if (!aiTheme.trim() || isGeneratingPractice) return;
                    setIsGeneratingPractice(true);
                    try {
                      const workout = await generateThemedWorkout(
                        aiTheme.trim(),
                      );
                      startGroupChallenge(workout);
                      setAiTheme("");
                    } catch (error) {
                      console.error("AI Generation failed:", error);
                    } finally {
                      setIsGeneratingPractice(false);
                    }
                  }}
                  disabled={!aiTheme.trim() || isGeneratingPractice}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
                >
                  {isGeneratingPractice ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PlayCircle className="w-3.5 h-3.5" />
                  )}
                  Start
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {[
              {
                icon: Dumbbell,
                name: "Memorization",
                desc: "Fill in missing words",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                type: "memorization" as const,
              },
              {
                icon: Target,
                name: "Context Challenge",
                desc: "Multiple choice questions",
                color: "text-orange-400",
                bg: "bg-orange-500/10",
                type: "context" as const,
              },
              {
                icon: Zap,
                name: "Verse Match",
                desc: "Match reference to text",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                type: "verse-match" as const,
              },
            ].map((drill) => (
              <div
                key={drill.name}
                className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${drill.bg} flex items-center justify-center`}
                >
                  <drill.icon className={`w-5 h-5 ${drill.color}`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">
                    {drill.name}
                  </div>
                  <div className="text-xs text-gray-500">{drill.desc}</div>
                </div>
                <button
                  onClick={() => startPractice(drill.type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
