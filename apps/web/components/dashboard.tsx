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
import { useRouter } from "next/navigation";

export function Dashboard() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { startWorkout, startGroupChallenge } = useWorkout();
  const { startPractice } = usePractice();
  const user = state.user;
  const [isStartingDaily, setIsStartingDaily] = useState(false);
  const [aiTheme, setAiTheme] = useState("");
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
  const [practiceConfigType, setPracticeConfigType] = useState<
    "theme" | "book" | "chapter" | "random"
  >("random");
  const [practiceConfigValue, setPracticeConfigValue] = useState("");
  const router = useRouter();

  if (!user) return null;

  const today = new Date().toISOString().split("T")[0];
  const hasCompletedToday = user.lastWorkoutDate === today;

  const userGroupRank = state.groupMembers.findIndex(
    (m) => m.userId === user.id,
  );

  return (
    <div className="w-full">
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Welcome back,{" "}
            <span className="text-[var(--primary)] ">{user.name.split(" ")[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
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
          className={`group w-full relative overflow-hidden rounded-2xl border-2 border-foreground p-8 text-left transition-all duration-300 ${
            hasCompletedToday
              ? "bg-[#D1FAE5] cursor-default"
              : "bg-card hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer"
          }`}
          style={{
            boxShadow: hasCompletedToday
              ? "4px 4px 0px 0px #10B981"
              : "4px 4px 0px 0px var(--foreground)",
          }}
        >
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {hasCompletedToday ? (
                  <div
                    className="px-3 py-1 rounded-full bg-[#10B981] text-white text-xs font-bold border-2 border-foreground"
                    style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
                  >
                    ✓ Completed
                  </div>
                ) : (
                  <div
                    className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold border-2 border-foreground animate-pulse"
                    style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
                  >
                    Ready
                  </div>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                {hasCompletedToday
                  ? "Today's Workout Complete"
                  : "Start Today's Workout"}
              </h2>
              <p className="text-muted-foreground text-sm font-medium">
                {hasCompletedToday
                  ? "You've earned your rest. See you tomorrow."
                  : "3 drills · ~5 min · 300 pts max"}
              </p>
            </div>
            {!hasCompletedToday && (
              <div
                className="w-14 h-14 rounded-2xl bg-primary border-2 border-foreground flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
              >
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
          <div
            className="rounded-2xl bg-card border-2 border-foreground p-5 text-center hover:translate-y-[-2px] transition-all"
            style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
          >
            <div
              className="w-10 h-10 rounded-xl bg-primary border-2 border-foreground flex items-center justify-center mx-auto mb-3"
              style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
            >
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-black text-foreground">
              {user.streak}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-bold">
              Day Streak
            </div>
          </div>

          <div
            className="rounded-2xl bg-card border-2 border-foreground p-5 text-center hover:translate-y-[-2px] transition-all"
            style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
          >
            <div
              className="w-10 h-10 rounded-xl bg-[#F59E0B] border-2 border-foreground flex items-center justify-center mx-auto mb-3"
              style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
            >
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-black text-foreground">
              {user.totalScore.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-bold">
              Total Points
            </div>
          </div>

          <div
            className="rounded-2xl bg-card border-2 border-foreground p-5 text-center hover:translate-y-[-2px] transition-all"
            style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
          >
            <div
              className="w-10 h-10 rounded-xl bg-[#3B82F6] border-2 border-foreground flex items-center justify-center mx-auto mb-3"
              style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
            >
              {user.groupId ? (
                <Crown className="w-5 h-5 text-white" />
              ) : (
                <Users className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="text-2xl font-black text-foreground">
              {user.groupId
                ? userGroupRank >= 0
                  ? `#${userGroupRank + 1}`
                  : "-"
                : "-"}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-bold">
              {user.groupId ? "Group Rank" : "No Group"}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h3>

          <button
            onClick={() => router.push("/group")}
            className="w-full flex items-center gap-4 rounded-2xl bg-card border-2 border-foreground p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-left group"
            style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
          >
            <div
              className="w-12 h-12 rounded-xl bg-[#8B5CF6] border-2 border-foreground flex items-center justify-center group-hover:scale-110 transition-transform"
              style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
            >
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-foreground">Training Groups</div>
              <div className="text-sm text-muted-foreground">
                {user.groupId
                  ? "View your group leaderboard"
                  : "Join or create a group"}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          <div
            className="flex items-center gap-4 rounded-2xl bg-card border-2 border-foreground p-5"
            style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
          >
            <div
              className="w-12 h-12 rounded-xl bg-[#10B981] border-2 border-foreground flex items-center justify-center"
              style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
            >
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-foreground">Training History</div>
              <div className="text-sm text-muted-foreground">
                {user.lastWorkoutDate
                  ? `Last trained: ${new Date(user.lastWorkoutDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
                  : "No sessions yet"}
              </div>
            </div>
          </div>
        </div>

        {/* Workout Breakdown Preview */}
        <div
          className="rounded-2xl bg-card border-2 border-foreground p-6"
          style={{ boxShadow: "4px 4px 0px 0px var(--primary)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Quick Training</h3>
            <span
              className="text-xs text-white font-bold bg-primary px-3 py-1 rounded-full border-2 border-foreground"
              style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
            >
              Unlimited
            </span>
          </div>
          <div className="space-y-4">
            {/* AI Generator Option */}
            <div
              className="rounded-2xl bg-background border-2 border-foreground p-4"
              style={{ boxShadow: "3px 3px 0px 0px #3B82F6" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl bg-[#3B82F6] border-2 border-foreground flex items-center justify-center"
                  style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">
                    AI Theme Generator
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Custom workout by theme
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiTheme}
                  onChange={(e) => setAiTheme(e.target.value)}
                  placeholder="Theme (e.g. Love, Hope)"
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-card border-2 border-foreground text-foreground placeholder-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-colors font-medium"
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
                  className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 border-2 border-foreground"
                  style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
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

            <div className="h-px bg-foreground/10" />

            {/* Practice Options Section */}
            <div>
              <div className="text-sm font-bold text-foreground mb-2">
                Practice Options:
              </div>
              <div className="flex gap-2 mb-4 flex-col sm:flex-row">
                <select
                  value={practiceConfigType}
                  onChange={(e) =>
                    setPracticeConfigType(
                      e.target.value as "theme" | "book" | "chapter" | "random",
                    )
                  }
                  className="px-3 py-2 text-sm rounded-lg bg-background border-2 border-foreground text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors sm:w-1/3"
                >
                  <option value="random">Random Verses</option>
                  <option value="book">By Book</option>
                  <option value="chapter">By Chapter</option>
                  <option value="theme">By Theme</option>
                </select>
                {practiceConfigType !== "random" && (
                  <input
                    type="text"
                    value={practiceConfigValue}
                    onChange={(e) => setPracticeConfigValue(e.target.value)}
                    placeholder={
                      practiceConfigType === "book"
                        ? "e.g., Romans"
                        : practiceConfigType === "chapter"
                          ? "e.g., Romans 8"
                          : "e.g., Forgiveness"
                    }
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-card border-2 border-foreground text-foreground placeholder-[#B0AAA2] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-colors font-medium"
                  />
                )}
              </div>
            </div>

            {[
              {
                icon: Dumbbell,
                name: "Memorization",
                desc: "Fill in missing words",
                color: "#3B82F6",
                type: "memorization" as const,
              },
              {
                icon: Target,
                name: "Context Challenge",
                desc: "Multiple choice questions",
                color: "#F59E0B",
                type: "context" as const,
              },
              {
                icon: Zap,
                name: "Verse Match",
                desc: "Match reference to text",
                color: "#10B981",
                type: "verse-match" as const,
              },
            ].map((drill) => (
              <div
                key={drill.name}
                className="flex items-center gap-3 p-3 rounded-xl bg-background border-2 border-foreground"
                style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg border-2 border-foreground flex items-center justify-center"
                  style={{
                    backgroundColor: drill.color,
                    boxShadow: "2px 2px 0px 0px var(--foreground)",
                  }}
                >
                  <drill.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">
                    {drill.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{drill.desc}</div>
                </div>
                <button
                  onClick={() => {
                    const config =
                      practiceConfigType === "random" ||
                      !practiceConfigValue.trim()
                        ? undefined
                        : {
                            by: practiceConfigType as
                              | "theme"
                              | "book"
                              | "chapter",
                            value: practiceConfigValue,
                          };
                    startPractice(drill.type, config);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card hover:bg-primary hover:text-white text-xs font-bold text-foreground transition-colors border-2 border-foreground"
                  style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
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
