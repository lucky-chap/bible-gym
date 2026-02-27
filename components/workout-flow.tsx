"use client";

import { useWorkout } from "@/lib/store";
import { MemorizationDrill } from "./drills/memorization-drill";
import { ContextChallengeDrill } from "./drills/context-drill";
import { VerseMatchDrill } from "./drills/verse-match-drill";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { useAppDispatch } from "@/lib/store";

import { useState, useEffect } from "react";

export function WorkoutFlow() {
  const { workout, currentDrillIndex, completeDrill, nextDrill } = useWorkout();
  const dispatch = useAppDispatch();
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isTimerPaused) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerPaused]);

  if (!workout) return null;

  const currentDrill = workout.drills[currentDrillIndex];
  const progress = ((currentDrillIndex + 1) / 3) * 100;

  const drillLabels = ["Memorization", "Context Challenge", "Verse Match"];

  const handleDrillComplete = (score: number) => {
    completeDrill(currentDrill.type, score);
    setIsTimerPaused(false);
    nextDrill();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() =>
                dispatch({ type: "SET_VIEW", payload: "dashboard" })
              }
              className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit
            </button>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-gray-400">
                Drill {currentDrillIndex + 1}/3
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-orange-400 border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 rounded-md">
                {formatTime(secondsElapsed)}
              </span>
              <span className="text-sm font-bold text-orange-400 hidden sm:inline">
                {drillLabels[currentDrillIndex]}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Drill Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {currentDrill.type === "memorization" && (
          <MemorizationDrill
            drill={currentDrill}
            onComplete={handleDrillComplete}
            onShowResults={() => setIsTimerPaused(true)}
          />
        )}
        {currentDrill.type === "context" && (
          <ContextChallengeDrill
            drill={currentDrill}
            onComplete={handleDrillComplete}
            onShowResults={() => setIsTimerPaused(true)}
          />
        )}
        {currentDrill.type === "verse-match" && (
          <VerseMatchDrill
            drill={currentDrill}
            onComplete={handleDrillComplete}
            onShowResults={() => setIsTimerPaused(true)}
          />
        )}
      </main>
    </div>
  );
}
