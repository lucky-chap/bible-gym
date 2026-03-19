"use client";

import { useAppDispatch, useAppState } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Flame,
  Star,
  ArrowRight,
  BookOpen,
  Target,
  Zap,
  GripVertical,
} from "lucide-react";
import { useEffect, useState } from "react";

export function WorkoutComplete() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { workout, user } = state;
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!workout) return;
    const target = workout.totalScore;
    const duration = 1500;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedScore(Math.round(target * eased));

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    const timer = setTimeout(() => setShowDetails(true), 1200);
    return () => clearTimeout(timer);
  }, [workout]);

  if (!workout || !user) return null;

  const drillIcons = [
    { icon: BookOpen, label: "Memorization", color: "var(--color-memorization)" },
    { icon: Target, label: "Context", color: "var(--color-context)" },
    { icon: Zap, label: "Verse Match", color: "var(--color-verse-match)" },
    { icon: GripVertical, label: "Rearrange", color: "var(--color-rearrange)" },
  ];

  const scores = [
    workout.scores.memorization,
    workout.scores.context,
    workout.scores.verseMatch,
    workout.scores.rearrange,
  ];

  const getMotivation = () => {
    if (workout.totalScore >= 380)
      return { text: "LEGENDARY!", sub: "You crushed that workout!" };
    if (workout.totalScore >= 250)
      return { text: "STRONG REP!", sub: "Solid training session." };
    if (workout.totalScore >= 150)
      return { text: "GOOD EFFORT!", sub: "Every rep counts. Keep going." };
    return { text: "TRAINING DAY!", sub: "You showed up — that's what matters." };
  };

  const motivation = getMotivation();

  return (
    <div className="h-full w-full flex items-center justify-center p-6 py-12 relative">
      {/* Background texture */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-md text-center space-y-7">
        {/* Trophy — stamped in */}
        <div className="animate-stamp">
          <div
            className="w-20 h-20 rounded-2xl bg-primary border-2 border-foreground flex items-center justify-center mx-auto"
            style={{ boxShadow: "var(--shadow-brutal-lg)" }}
          >
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Score */}
        <div className="animate-forge-in stagger-1">
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-1.5 tabular-nums score-display">
            {animatedScore}
            <span className="text-xl text-muted-foreground font-black">/400</span>
          </h1>
          <div className="text-lg font-black text-primary tracking-tight">
            {motivation.text}
          </div>
          <p className="text-muted-foreground mt-0.5 font-medium text-sm">
            {motivation.sub}
          </p>
        </div>

        {/* Streak */}
        <div className="animate-forge-in stagger-2">
          <div
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-card border-2 border-foreground"
            style={{ boxShadow: "var(--shadow-brutal-sm)" }}
          >
            <Flame className="w-5 h-5 text-primary animate-fire" />
            <div className="text-left">
              <div className="text-base font-black text-foreground score-display">
                {user.streak} Day Streak
              </div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Keep it going tomorrow!
              </div>
            </div>
          </div>
        </div>

        {/* Drill Breakdown */}
        {showDetails && (
          <div className="space-y-2.5 animate-slide-up">
            {drillIcons.map((drill, i) => (
              <div
                key={drill.label}
                className={`flex items-center gap-3 p-3.5 rounded-xl bg-card border-2 border-foreground stagger-${i + 1}`}
                style={{ boxShadow: "var(--shadow-brutal-sm)" }}
              >
                <div
                  className="w-9 h-9 rounded-lg border-2 border-foreground flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: drill.color,
                    boxShadow: "var(--shadow-brutal-press)",
                  }}
                >
                  <drill.icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-xs font-black text-foreground uppercase tracking-wider">
                    {drill.label}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-md bg-muted border border-foreground/20 overflow-hidden">
                    <div
                      className="h-full rounded-sm bg-primary transition-all duration-1000"
                      style={{
                        width: `${scores[i]}%`,
                        transitionDelay: `${i * 200}ms`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-black text-foreground w-10 text-right score-display">
                    {scores[i]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total Points */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Star className="w-4 h-4 text-[var(--color-context)]" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Total lifetime: {user.totalScore.toLocaleString()} pts
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => {
              const target =
                state.returnView === "group" ? "/group" : "/dashboard";
              router.push(target);
            }}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-sm border-2 border-foreground btn-brutal flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            {state.returnView === "group" ? "Back to Group" : "Back to Dashboard"}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const target =
                state.returnView === "group" ? "/group" : "/dashboard";
              router.push(target);
            }}
            className="text-muted-foreground text-xs hover:text-foreground transition-colors font-bold uppercase tracking-wider"
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1" />
            {state.returnView === "group"
              ? "Great team effort"
              : "See you at the gym tomorrow"}
          </button>
        </div>
      </div>
    </div>
  );
}
