"use client";

import { useAppState, useAppDispatch } from "@/lib/store";
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
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: Target,
      label: "Context",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      icon: Zap,
      label: "Verse Match",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      {/* Celebration background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-[150px] animate-pulse" />
        <div
          className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative w-full max-w-md text-center space-y-8">
        {/* Trophy */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/30 animate-bounce">
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Score */}
        <div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tabular-nums">
            {animatedScore}
            <span className="text-2xl text-gray-500">/300</span>
          </h1>
          <div className="text-xl font-extrabold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            {motivation.text}
          </div>
          <p className="text-gray-500 mt-1">{motivation.sub}</p>
        </div>

        {/* Streak */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5">
          <Flame className="w-6 h-6 text-orange-400" />
          <div className="text-left">
            <div className="text-lg font-extrabold text-white">
              {user.streak} Day Streak
            </div>
            <div className="text-xs text-gray-500">Keep it going tomorrow!</div>
          </div>
        </div>

        {/* Drill Breakdown */}
        {showDetails && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {drillIcons.map((drill, i) => (
              <div
                key={drill.label}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${drill.bg} flex items-center justify-center`}
                >
                  <drill.icon className={`w-5 h-5 ${drill.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-white">
                    {drill.label}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-1000"
                      style={{
                        width: `${scores[i]}%`,
                        transitionDelay: `${i * 200}ms`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white w-12 text-right">
                    {scores[i]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total Points */}
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium">
            Total lifetime: {user.totalScore.toLocaleString()} pts
          </span>
        </div>

        {/* Back to Dashboard/Group */}
        <button
          onClick={() =>
            dispatch({
              type: "SET_VIEW",
              payload: workout.isGroupChallenge ? "group" : "dashboard",
            })
          }
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2"
        >
          {workout.isGroupChallenge ? "Back to Group" : "Back to Dashboard"}
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={() =>
            dispatch({
              type: "SET_VIEW",
              payload: workout.isGroupChallenge ? "group" : "dashboard",
            })
          }
          className="text-gray-600 text-sm hover:text-gray-400 transition-colors"
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
