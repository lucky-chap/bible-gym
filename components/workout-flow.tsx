"use client";

import { useWorkout } from "@/lib/store";
import { MemorizationDrill } from "./drills/memorization-drill";
import { ContextChallengeDrill } from "./drills/context-drill";
import { VerseMatchDrill } from "./drills/verse-match-drill";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

export function WorkoutFlow() {
  const { workout, currentDrillIndex, completeDrill, nextDrill } = useWorkout();
  const router = useRouter();
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
    <div className="h-full w-full">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit
            </button>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-bold text-foreground">
                Drill {currentDrillIndex + 1}/3
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-sm font-bold text-white bg-primary px-3 py-1 rounded-full border-2 border-foreground"
                style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
              >
                {formatTime(secondsElapsed)}
              </span>
              <span className="text-sm font-bold text-foreground hidden sm:inline">
                {drillLabels[currentDrillIndex]}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-muted border-2 border-foreground overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
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
