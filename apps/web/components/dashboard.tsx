"use client";

import { useAppState, useWorkout, useMastery } from "@/lib/store";
import {
  Flame,
  Trophy,
  Users,
  Dumbbell,
  ChevronRight,
  Calendar,
  Target,
  Zap,
  Crown,
  PlayCircle,
  Sparkles,
  Loader2,
  BookOpen,
  GripVertical,
} from "lucide-react";
/* import {
  generateRandomAIDrill,
  generateThemedWorkout,
} from "@/app/actions/generate-drills"; */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VerseSelector } from "./mastery/verse-selector";

export function Dashboard() {
  const state = useAppState();
  const { startWorkout, startGroupChallenge } = useWorkout();
  const { masteryStats } = useMastery();
  const user = state.user;
  const [isStartingDaily, setIsStartingDaily] = useState(false);
  const [aiTheme, setAiTheme] = useState("");
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
  const [showMasterySelector, setShowMasterySelector] = useState(false);
  const router = useRouter();

  if (state.isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center space-y-4 px-6 md:px-0">
        <h2 className="text-2xl md:text-3xl font-black text-foreground">
          Session Expired
        </h2>
        <p className="text-muted-foreground font-bold">
          Please log in to view your dashboard.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-primary text-white font-bold rounded-xl border-2 border-foreground hover:-translate-y-1 hover:-translate-x-1 transition-transform"
          style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
        >
          Return Home
        </button>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const hasCompletedToday = user.lastWorkoutDate === today;

  const userGroupRank = state.groupMembers.findIndex(
    (m) => m.userId === user.id,
  );

  return (
    <div className="w-full">
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Top Section: Greeting & Quick Stats Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground">
              Welcome back,{" "}
              <span className="text-primary">{user.name.split(" ")[0]}</span>
            </h1>
            <p className="text-muted-foreground mt-1 font-medium text-lg">
              {hasCompletedToday
                ? "Great work today! Come back tomorrow for your next session."
                : "Your daily workout is ready. Let's train."}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div
              className="flex flex-col items-center px-4 py-2 bg-card border-2 border-foreground rounded-xl"
              style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
            >
              <span className="text-xs font-black text-muted-foreground uppercase">
                Streak
              </span>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-primary fill-primary" />
                <span className="text-xl font-black">{user.streak}</span>
              </div>
            </div>
            <div
              className="flex flex-col items-center px-4 py-2 bg-card border-2 border-foreground rounded-xl"
              style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
            >
              <span className="text-xs font-black text-muted-foreground uppercase">
                Points
              </span>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xl font-black">
                  {user.totalScore.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Start Workout CTA */}
            <button
              onClick={async () => {
                if (!hasCompletedToday) {
                  setIsStartingDaily(true);
                  try {
                    // const aiDrill = await generateRandomAIDrill();
                    // await startWorkout(aiDrill);
                    await startWorkout(); // Fallback to normal
                  } finally {
                    setIsStartingDaily(false);
                  }
                }
              }}
              disabled={hasCompletedToday || isStartingDaily}
              className={`group w-full relative overflow-hidden rounded-3xl border-2 border-foreground p-8 md:p-10 text-left transition-all duration-300 ${
                hasCompletedToday
                  ? "bg-[#D1FAE5] cursor-default"
                  : "bg-card hover:bg-primary/5 hover:translate-x-[-4px] hover:translate-y-[-4px] cursor-pointer"
              }`}
              style={{
                boxShadow: hasCompletedToday
                  ? "4px 4px 0px 0px #10B981"
                  : "8px 8px 0px 0px var(--foreground)",
              }}
            >
              <div className="relative flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {hasCompletedToday ? (
                      <div
                        className="px-3 py-1 rounded-full bg-[#10B981] text-white text-xs font-bold border-2 border-foreground"
                        style={{
                          boxShadow: "2px 2px 0px 0px var(--foreground)",
                        }}
                      >
                        ✓ MISSION ACCOMPLISHED
                      </div>
                    ) : (
                      <div
                        className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold border-2 border-foreground animate-pulse"
                        style={{
                          boxShadow: "2px 2px 0px 0px var(--foreground)",
                        }}
                      >
                        DAILY CHALLENGE
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-foreground leading-tight">
                    {hasCompletedToday
                      ? "Rest Day in Progress"
                      : "Master Your Verse\nof the Day"}
                  </h2>
                  <p className="text-muted-foreground text-lg font-bold">
                    {hasCompletedToday
                      ? "You've earned your points. See you at sunrise."
                      : "4 intense drills · ~6 min session · 400 pts potential"}
                  </p>
                </div>
                {!hasCompletedToday && (
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-primary border-2 border-foreground flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ml-4"
                    style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
                  >
                    {isStartingDaily ? (
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : (
                      <PlayCircle className="w-10 h-10 text-white fill-white/20" />
                    )}
                  </div>
                )}
              </div>
            </button>

            {/* Workout Breakdown Preview */}
            <div
              className="rounded-3xl bg-card border-2 border-foreground p-8"
              style={{ boxShadow: "6px 6px 0px 0px var(--primary)" }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-foreground">
                    Elite Training
                  </h3>
                  <p className="text-muted-foreground font-bold">
                    Choose your specialized focus
                  </p>
                </div>
                <span
                  className="text-sm text-white font-black bg-primary px-4 py-1.5 rounded-full border-2 border-foreground"
                  style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
                >
                  UNLIMITED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {/* AI Generator Option (Disabled)
                <div
                  className="rounded-2xl bg-[#EFF6FF] border-2 border-foreground p-6 transition-all hover:bg-[#DBEAFE]"
                  style={{ boxShadow: "4px 4px 0px 0px #3B82F6" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl bg-[#3B82F6] border-2 border-foreground flex items-center justify-center shrink-0"
                      style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
                    >
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-foreground">
                        AI Theme Forge
                      </div>
                      <div className="text-sm font-bold text-muted-foreground">
                        Create a custom drill set for any topic or emotional
                        state
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={aiTheme}
                        onChange={(e) => setAiTheme(e.target.value)}
                        placeholder="Theme (e.g. Anxiety, Courage, Joy)"
                        className="w-full pl-10 pr-4 py-3 text-base rounded-xl bg-card border-2 border-foreground text-foreground placeholder-[#B0AAA2] focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/20 transition-all font-bold"
                      />
                    </div>
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
                      className="px-8 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-black rounded-xl transition-all flex items-center gap-2 border-2 border-foreground active:translate-y-0 translate-y-[-2px]"
                      style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
                    >
                      {isGeneratingPractice ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <PlayCircle className="w-5 h-5" />
                      )}
                      Forge
                    </button>
                  </div>
                </div>
                */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: BookOpen,
                      name: "Mastery",
                      desc: "Step-by-step",
                      color: "#8B5CF6",
                      onClick: () => setShowMasterySelector(true),
                    },
                    {
                      icon: Dumbbell,
                      name: "Memorization",
                      desc: "Fill blanks",
                      color: "#3B82F6",
                      type: "memorization" as const,
                      onClick: () => router.push("/practice/memorization"),
                    },
                    {
                      icon: Target,
                      name: "Context",
                      desc: "Deep study",
                      color: "#F59E0B",
                      type: "context" as const,
                      onClick: () => router.push("/practice/context"),
                    },
                    {
                      icon: Zap,
                      name: "Match",
                      desc: "Quick reflex",
                      color: "#10B981",
                      type: "verse-match" as const,
                      onClick: () => router.push("/practice/verse-match"),
                    },
                    {
                      icon: GripVertical,
                      name: "Rearrange",
                      desc: "Drag & Drop",
                      color: "#EC4899",
                      type: "rearrange" as const,
                      onClick: () => router.push("/practice/rearrange"),
                    },
                  ].map((drill) => (
                    <button
                      key={drill.name}
                      onClick={drill.onClick}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-foreground hover:translate-y-[-4px] transition-all group text-center`}
                      style={{
                        boxShadow: "4px 4px 0px 0px var(--foreground)",
                        backgroundColor: `${drill.color}10`, // 10% opacity hex
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl border-2 border-foreground flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: drill.color,
                          boxShadow: "3px 3px 0px 0px var(--foreground)",
                        }}
                      >
                        <drill.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="font-black text-foreground">
                        {drill.name}
                      </div>
                      <div className="text-xs font-bold text-muted-foreground mt-1 uppercase">
                        {drill.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {showMasterySelector && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-4 border-foreground rounded-3xl p-8 md:p-12 shadow-[12px 12px 0px 0px_rgba(0,0,0,1)]">
                      <button
                        onClick={() => setShowMasterySelector(false)}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-muted border-2 border-foreground hover:translate-y-[-2px] transition-all"
                      >
                        <ChevronRight className="w-6 h-6 rotate-90" />
                      </button>
                      <VerseSelector />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Stats Vertical Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-2">
                Your Progress
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div
                  className="rounded-2xl bg-[#FFF1F2] border-2 border-foreground p-5 flex items-center gap-4 hover:translate-x-1 hover:bg-[#FFE4E6] transition-all"
                  style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-primary border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-foreground leading-none">
                      {user.streak}
                    </div>
                    <div className="text-xs text-muted-foreground font-black uppercase tracking-tighter mt-1">
                      Day Streak
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl bg-[#F5F3FF] border-2 border-foreground p-5 flex items-center gap-4 hover:translate-x-1 hover:bg-[#EDE9FE] transition-all"
                  style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-[#8B5CF6] border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-foreground leading-none">
                      {masteryStats.streak}
                    </div>
                    <div className="text-xs text-muted-foreground font-black uppercase tracking-tighter mt-1">
                      Mastery Streak
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl bg-[#FFFBEB] border-2 border-foreground p-5 flex items-center gap-4 hover:translate-x-1 hover:bg-[#FEF3C7] transition-all"
                  style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-[#F59E0B] border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-foreground leading-none">
                      {masteryStats.totalMastered}
                    </div>
                    <div className="text-xs text-muted-foreground font-black uppercase tracking-tighter mt-1">
                      Verses Mastered
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl bg-[#ECFEFF] border-2 border-foreground p-5 flex items-center gap-4 hover:translate-x-1 hover:bg-[#CFFAFE] transition-all"
                  style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-[#0891B2] border-2 border-foreground flex items-center justify-center font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {masteryStats.consistencyScore}%
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                        Consistency Score
                      </div>
                    </div>
                    <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden border border-foreground/20">
                      <div
                        className="h-full bg-[#0891B2] transition-all duration-500"
                        style={{ width: `${masteryStats.consistencyScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-2">
                Social & History
              </h3>

              <div className="space-y-4">
                <button
                  onClick={() => router.push("/group")}
                  className="w-full flex items-center gap-4 rounded-2xl bg-[#F5F3FF] border-2 border-foreground p-5 hover:translate-x-1 hover:bg-[#EDE9FE] transition-all text-left group"
                  style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#8B5CF6] border-2 border-foreground flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-black text-foreground truncate">
                      Training Groups
                    </div>
                    <div className="text-xs font-bold text-muted-foreground truncate">
                      {user.groupId ? "Leaderboard & Stats" : "Find Your Squad"}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-all" />
                </button>

                <div
                  className="w-full flex items-center gap-4 rounded-2xl bg-[#F0FDF4] border-2 border-foreground p-5 transition-all text-left"
                  style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#10B981] border-2 border-foreground flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-black text-foreground truncate">
                      Activity Log
                    </div>
                    <div className="text-xs font-bold text-muted-foreground truncate">
                      {user.lastWorkoutDate
                        ? `Last: ${new Date(user.lastWorkoutDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
                        : "No activity yet"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo/Tip Box */}
            <div className="rounded-3xl bg-primary/10 border-2 border-dashed border-primary p-6 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-black text-foreground mb-1">Did you know?</h4>
              <p className="text-xs font-bold text-muted-foreground">
                Training with a group increases your consistency by 40%. Join a
                squad today!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
