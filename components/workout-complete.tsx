"use client";

import { useAppDispatch, useAppState } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Flame,
  Star,
  ArrowRight,
  Dumbbell,
  Target,
  Zap,
  BookOpen,
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
    // Animate score counting up
    const target = workout.totalScore;
    const duration = 1500;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // EaseOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedScore(Math.round(target * eased));

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);

    // Show details after score animation
    const timer = setTimeout(() => setShowDetails(true), 1200);
    return () => clearTimeout(timer);
  }, [workout]);

  if (!workout || !user) return null;

  const drillIcons = [
    {
      icon: BookOpen,
      label: "Memorization",
      color: "#3B82F6",
    },
    {
      icon: Target,
      label: "Context",
      color: "#F59E0B",
    },
    {
      icon: Zap,
      label: "Verse Match",
      color: "#10B981",
    },
  ];

  const scores = [
    workout.scores.memorization,
    workout.scores.context,
    workout.scores.verseMatch,
  ];

  const getMotivation = () => {
    if (workout.totalScore >= 280)
      return { text: "LEGENDARY! 🔥", sub: "You crushed that workout!" };
    if (workout.totalScore >= 200)
      return { text: "STRONG REP! 💪", sub: "Solid training session." };
    if (workout.totalScore >= 100)
      return {
        text: "GOOD EFFORT! ✊",
        sub: "Every rep counts. Keep going.",
      };
    return {
      text: "TRAINING DAY! 📖",
      sub: "You showed up — that's what matters.",
    };
  };

  const motivation = getMotivation();

  return (
    <div className="h-full w-full flex items-center justify-center p-6 py-12">
      <div className="relative w-full max-w-md text-center space-y-8">
        {/* Trophy */}
        <div className="relative">
          <div
            className="w-24 h-24 rounded-3xl bg-primary border-2 border-foreground flex items-center justify-center mx-auto animate-bounce"
            style={{ boxShadow: "6px 6px 0px 0px var(--foreground)" }}
          >
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Score */}
        <div>
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-2 tabular-nums">
            {animatedScore}
            <span className="text-2xl text-muted-foreground">/300</span>
          </h1>
          <div className="text-xl font-black text-[var(--primary)] ">
            {motivation.text}
          </div>
          <p className="text-muted-foreground mt-1 font-medium">{motivation.sub}</p>
        </div>

        {/* Streak */}
        <div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border-2 border-foreground"
          style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
        >
          <Flame className="w-6 h-6 text-[var(--primary)]" />
          <div className="text-left">
            <div className="text-lg font-black text-foreground">
              {user.streak} Day Streak
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Keep it going tomorrow!
            </div>
          </div>
        </div>

        {/* Drill Breakdown */}
        {showDetails && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {drillIcons.map((drill, i) => (
              <div
                key={drill.label}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border-2 border-foreground"
                style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl border-2 border-foreground flex items-center justify-center"
                  style={{
                    backgroundColor: drill.color,
                    boxShadow: "2px 2px 0px 0px var(--foreground)",
                  }}
                >
                  <drill.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-foreground">
                    {drill.label}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-20 rounded-full bg-muted border-2 border-foreground overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000"
                      style={{
                        width: `${scores[i]}%`,
                        transitionDelay: `${i * 200}ms`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-black text-foreground w-12 text-right">
                    {scores[i]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total Points */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Star className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-sm font-bold">
            Total lifetime: {user.totalScore.toLocaleString()} pts
          </span>
        </div>

        {/* Back to Dashboard/Group */}
        <button
          onClick={() =>
            router.push(workout.isGroupChallenge ? "/group" : "/dashboard")
          }
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-base border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 flex items-center justify-center gap-2"
          style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
        >
          {workout.isGroupChallenge ? "Back to Group" : "Back to Dashboard"}
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={() =>
            router.push(workout.isGroupChallenge ? "/group" : "/dashboard")
          }
          className="text-muted-foreground text-sm hover:text-foreground transition-colors font-bold"
        >
          <Dumbbell className="w-4 h-4 inline mr-1" />
          {workout.isGroupChallenge
            ? "Great team effort"
            : "See you at the gym tomorrow"}
        </button>
      </div>
    </div>
  );
}
