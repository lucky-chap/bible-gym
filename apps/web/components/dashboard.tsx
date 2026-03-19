"use client";

import {
  useAppState,
  useWorkout,
  useMastery,
  useAppDispatch,
} from "@/lib/store";
import {
  Flame,
  Trophy,
  Users,
  Dumbbell,
  ChevronRight,
  Calendar,
  Target,
  Zap,
  PlayCircle,
  Sparkles,
  Loader2,
  BookOpen,
  GripVertical,
  HelpCircle,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { VerseSelector } from "./mastery/verse-selector";

export function Dashboard() {
  const state = useAppState();
  const { startWorkout, startGroupChallenge } = useWorkout();
  const dispatch = useAppDispatch();
  const { masteryStats } = useMastery();
  const user = state.user;
  const [isStartingDaily, setIsStartingDaily] = useState(false);
  const [aiTheme, setAiTheme] = useState("");
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
  const [showMasterySelector, setShowMasterySelector] = useState(false);
  const router = useRouter();

  useEffect(() => {
    dispatch({ type: "SET_VIEW", payload: "dashboard" });
  }, [dispatch]);

  if (state.isLoading || !user) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!state.isLoading && !user) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 text-center space-y-4 px-6 md:px-0">
        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Session Expired
        </h2>
        <p className="text-muted-foreground font-bold text-sm">
          Please log in to view your dashboard.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-primary text-primary-foreground font-black rounded-xl border-2 border-foreground btn-brutal uppercase text-sm tracking-wide"
        >
          Return Home
        </button>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const hasCompletedToday = user.lastWorkoutDate === today;

  return (
    <div className="w-full">
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Top Section: Greeting & Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              Welcome back,{" "}
              <span className="text-primary">{user.name.split(" ")[0]}</span>
            </h1>
            <p className="text-muted-foreground mt-1 font-medium text-sm">
              {hasCompletedToday
                ? "Great work today! Come back tomorrow for your next session."
                : "Your daily workout is ready. Let's train."}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <div
              className="flex flex-col items-center px-4 py-2 bg-card border-2 border-foreground rounded-lg"
              style={{ boxShadow: "var(--shadow-brutal-press)" }}
            >
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Streak
              </span>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-primary fill-primary animate-fire" />
                <span className="text-lg font-black score-display">{user.streak}</span>
              </div>
            </div>
            <div
              className="flex flex-col items-center px-4 py-2 bg-card border-2 border-foreground rounded-lg"
              style={{ boxShadow: "var(--shadow-brutal-press)" }}
            >
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Points
              </span>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-[var(--color-context)]" />
                <span className="text-lg font-black score-display">
                  {user.totalScore.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-7">
            {/* Start Workout CTA */}
            <button
              onClick={async () => {
                if (!hasCompletedToday) {
                  setIsStartingDaily(true);
                  try {
                    await startWorkout();
                  } finally {
                    setIsStartingDaily(false);
                  }
                }
              }}
              disabled={hasCompletedToday || isStartingDaily}
              className={`group w-full relative overflow-hidden rounded-2xl border-2 border-foreground p-7 md:p-9 text-left transition-all duration-200 ${
                hasCompletedToday
                  ? "bg-[#D6F5E5] cursor-default"
                  : "bg-card hover:bg-primary/5 cursor-pointer card-brutal"
              }`}
              style={{
                boxShadow: hasCompletedToday
                  ? "4px 4px 0px 0px var(--color-verse-match)"
                  : "var(--shadow-brutal-xl)",
              }}
            >
              {/* Lined texture overlay */}
              <div className="absolute inset-0 bg-lined opacity-30 pointer-events-none" />

              <div className="relative flex items-center justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    {hasCompletedToday ? (
                      <div
                        className="px-3 py-1 rounded-md bg-[var(--color-verse-match)] text-white text-[10px] font-black border-2 border-foreground uppercase tracking-widest"
                        style={{ boxShadow: "var(--shadow-brutal-press)" }}
                      >
                        ✓ Mission Accomplished
                      </div>
                    ) : (
                      <div
                        className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-black border-2 border-foreground animate-breathe uppercase tracking-widest"
                      >
                        Daily Challenge
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight tracking-tight">
                    {hasCompletedToday
                      ? "Rest Day in Progress"
                      : "Build Spiritual Muscles"}
                  </h2>
                  <p className="text-muted-foreground text-sm font-bold">
                    {hasCompletedToday
                      ? "You've earned your points. Resets at 12:00am UTC."
                      : "4 intense drills · ~6 min session · 400 pts potential"}
                  </p>
                </div>
                {!hasCompletedToday && (
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary border-2 border-foreground flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ml-4"
                    style={{ boxShadow: "var(--shadow-brutal)" }}
                  >
                    {isStartingDaily ? (
                      <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                    ) : (
                      <PlayCircle className="w-8 h-8 text-primary-foreground fill-primary-foreground/20" />
                    )}
                  </div>
                )}
              </div>
            </button>

            {/* Elite Training Section */}
            <div
              className="rounded-2xl bg-card border-2 border-foreground p-7"
              style={{ boxShadow: "var(--shadow-brutal-purple)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">
                    Elite Training
                  </h3>
                  <p className="text-muted-foreground font-bold text-xs">
                    Choose your specialized focus
                  </p>
                </div>
                <span
                  className="text-[10px] text-primary-foreground font-black bg-[var(--color-mastery)] px-3 py-1.5 rounded-md border-2 border-foreground uppercase tracking-widest"
                  style={{ boxShadow: "var(--shadow-brutal-press)" }}
                >
                  Unlimited
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    icon: BookOpen,
                    name: "Mastery",
                    desc: "Step-by-step",
                    color: "var(--color-mastery)",
                    bgHex: "#6B4FA0",
                    points: user.masteryTotal || 0,
                    pointsLabel: "Pts",
                    onClick: () => setShowMasterySelector(true),
                  },
                  {
                    icon: Dumbbell,
                    name: "Memorize",
                    desc: "Fill blanks",
                    color: "var(--color-memorization)",
                    bgHex: "#2D6A9F",
                    points: user.memorizationTotal,
                    onClick: () => router.push("/practice/memorization"),
                  },
                  {
                    icon: Zap,
                    name: "Match",
                    desc: "Quick reflex",
                    color: "var(--color-verse-match)",
                    bgHex: "#2A7D5F",
                    points: user.verseMatchTotal,
                    onClick: () => router.push("/practice/verse-match"),
                  },
                  {
                    icon: GripVertical,
                    name: "Rearrange",
                    desc: "Drag & drop",
                    color: "var(--color-rearrange)",
                    bgHex: "#9B4D8B",
                    points: user.rearrangeTotal,
                    onClick: () => router.push("/practice/rearrange"),
                  },
                ].map((drill) => (
                  <button
                    key={drill.name}
                    onClick={drill.onClick}
                    className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-foreground transition-all group text-center relative overflow-hidden card-brutal"
                    style={{ backgroundColor: `${drill.bgHex}08` }}
                  >
                    {drill.points ? (
                      <div
                        className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl-lg font-black text-[10px] border-b-2 border-l-2 border-foreground text-white"
                        style={{ backgroundColor: drill.color, boxShadow: "-2px 2px 0px 0px rgba(0,0,0,1)" }}
                      >
                        {drill.points.toLocaleString()}{" "}
                        {drill.pointsLabel || "Pts"}
                      </div>
                    ) : null}
                    <div
                      className="w-12 h-12 rounded-xl border-2 border-foreground flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: drill.color,
                        boxShadow: "var(--shadow-brutal-press)",
                      }}
                    >
                      <drill.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-black text-foreground text-sm">
                      {drill.name}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider">
                      {drill.desc}
                    </div>
                  </button>
                ))}
              </div>

              {showMasterySelector && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
                  onClick={() => setShowMasterySelector(false)}
                >
                  <div
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-3 border-foreground rounded-2xl p-8 md:p-10"
                    style={{ boxShadow: "var(--shadow-brutal-xl)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setShowMasterySelector(false)}
                      className="absolute top-3 right-5 p-2 rounded-lg bg-muted border-2 border-foreground hover:-translate-y-0.5 transition-transform"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <VerseSelector />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-7">
            {/* Stats */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] pl-1">
                Your Progress
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {/* Streak */}
                <div
                  className="rounded-xl bg-[#FFF0F1] border-2 border-foreground p-4 flex items-center gap-3 card-brutal"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-primary border-2 border-foreground flex items-center justify-center" style={{ boxShadow: "var(--shadow-brutal-press)" }}>
                    <Flame className="w-5 h-5 text-primary-foreground animate-fire" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-foreground leading-none score-display">
                      {user.streak}
                    </div>
                    <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                      Day Streak
                    </div>
                  </div>
                </div>

                {/* Mastery Streak */}
                <div
                  className="rounded-xl bg-[#F3F0FF] border-2 border-foreground p-4 flex items-center gap-3 card-brutal"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-[var(--color-mastery)] border-2 border-foreground flex items-center justify-center" style={{ boxShadow: "var(--shadow-brutal-press)" }}>
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-foreground leading-none score-display">
                      {masteryStats.streak}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                      Mastery Streak
                      <Popover>
                        <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                          <HelpCircle className="w-3.5 h-3.5 text-foreground/40 hover:text-primary transition-colors cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 p-3 text-xs font-medium border-2 border-foreground"
                          style={{ boxShadow: "var(--shadow-brutal)" }}
                          side="top"
                        >
                          Tracks how many consecutive days you've practiced your
                          Mastery verses. Rewards consistent, daily memorization
                          habits.
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Verses Mastered */}
                <div
                  className="rounded-xl bg-[#FFF8EB] border-2 border-foreground p-4 flex items-center gap-3 card-brutal"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-[var(--color-context)] border-2 border-foreground flex items-center justify-center" style={{ boxShadow: "var(--shadow-brutal-press)" }}>
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-foreground leading-none score-display">
                      {masteryStats.totalMastered}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                      Verses Mastered
                      <Popover>
                        <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                          <HelpCircle className="w-3.5 h-3.5 text-foreground/40 hover:text-primary transition-colors cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 p-3 text-xs font-medium border-2 border-foreground"
                          style={{ boxShadow: "var(--shadow-brutal)" }}
                          side="top"
                        >
                          Tracks how many verses you have successfully pushed
                          all the way to Level 5 ("Mastered") status with 90%+
                          accuracy.
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Consistency Score */}
                <div
                  className="rounded-xl bg-[#ECFCFF] border-2 border-foreground p-4 flex items-center gap-3 card-brutal"
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-[#0891B2] border-2 border-foreground flex items-center justify-center font-black text-white text-xs" style={{ boxShadow: "var(--shadow-brutal-press)" }}>
                    {masteryStats.consistencyScore}%
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                        Consistency
                        <Popover>
                          <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                            <HelpCircle className="w-3.5 h-3.5 text-foreground/40 hover:text-primary transition-colors cursor-pointer" />
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-64 p-3 text-xs font-medium border-2 border-foreground"
                            style={{ boxShadow: "var(--shadow-brutal)" }}
                            side="top"
                          >
                            A percentage that tracks your overall accuracy and
                            reliability across all active Mastery verses.
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden border border-foreground/20">
                      <div
                        className="h-full bg-[#0891B2] rounded-full transition-all duration-500"
                        style={{ width: `${masteryStats.consistencyScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] pl-1">
                Social & History
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/group")}
                  className="w-full flex items-center gap-3 rounded-xl bg-[#F3F0FF] border-2 border-foreground p-4 text-left group card-brutal"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-mastery)] border-2 border-foreground flex items-center justify-center group-hover:scale-105 transition-transform shrink-0" style={{ boxShadow: "var(--shadow-brutal-press)" }}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-black text-foreground text-sm truncate">
                      Training Groups
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground truncate">
                      {user.groupId ? "Leaderboard & Stats" : "Find Your Squad"}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all" />
                </button>

                <div
                  className="w-full flex items-center gap-3 rounded-xl bg-[#EDFCF2] border-2 border-foreground p-4 text-left"
                  style={{ boxShadow: "var(--shadow-brutal)" }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-verse-match)] border-2 border-foreground flex items-center justify-center shrink-0" style={{ boxShadow: "var(--shadow-brutal-press)" }}>
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-black text-foreground text-sm truncate">
                      Activity Log
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground truncate">
                      {user.lastWorkoutDate
                        ? `Last: ${new Date(user.lastWorkoutDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
                        : "No activity yet"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo/Tip Box */}
            {!user.groupId && (
              <div className="rounded-xl bg-primary/5 border-2 border-dashed border-primary/30 p-5 text-center">
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                <h4 className="font-black text-foreground text-sm mb-1">
                  Did you know?
                </h4>
                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                  Training with a group increases your consistency by 40%. Join
                  a squad today!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
