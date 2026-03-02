"use client";

import { useWorkout } from "@/lib/store";
import { MemorizationDrill } from "./drills/memorization-drill";
import { ContextChallengeDrill } from "./drills/context-drill";
import { VerseMatchDrill } from "./drills/verse-match-drill";
import { RearrangeDrillComponent } from "./drills/rearrange-drill";
import { ArrowLeft, Dumbbell, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

export function WorkoutFlow() {
  const { workout, currentDrillIndex, handleDrillComplete } = useWorkout();
  const router = useRouter();
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isTimerPaused && !isSaving) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerPaused, isSaving]);

  if (!workout) return null;

  const currentDrill = workout.drills[currentDrillIndex];
  const progress = ((currentDrillIndex + 1) / workout.drills.length) * 100;

  const drillLabels: Record<string, string> = {
    memorization: "Memorization",
    context: "Context Challenge",
    "verse-match": "Verse Match",
    rearrange: "Rearrange",
  };

  const _handleDrillComplete = async (score: number) => {
    if (currentDrillIndex === workout.drills.length - 1) {
      setIsSaving(true);
    }
    await handleDrillComplete(currentDrill.type, score);
    if (currentDrillIndex !== workout.drills.length - 1) {
      setIsTimerPaused(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (isSaving) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center space-y-6 px-6 bg-background">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-foreground">
            Mission Accomplished!
          </h2>
          <p className="text-xl text-muted-foreground font-bold">
            Saving your score to the database...
          </p>
          <p className="text-[#EF4444] font-bold animate-pulse">
            Please do not close this page.
          </p>
        </div>
      </div>
    );
  }

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
              <Dumbbell className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                Drill {currentDrillIndex + 1}/{workout.drills.length}
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
                {drillLabels[currentDrill.type]}
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
            onComplete={_handleDrillComplete}
            onShowResults={() => setIsTimerPaused(true)}
          />
        )}
        {currentDrill.type === "context" && (
          <ContextChallengeDrill
            drill={currentDrill}
            onComplete={_handleDrillComplete}
            onShowResults={() => setIsTimerPaused(true)}
          />
        )}
        {currentDrill.type === "verse-match" && (
          <VerseMatchDrill
            drill={currentDrill}
            onComplete={_handleDrillComplete}
            onShowResults={() => setIsTimerPaused(true)}
          />
        )}
        {currentDrill.type === "rearrange" && (
          <RearrangeDrillComponent
            drill={currentDrill}
            onComplete={(score) => _handleDrillComplete(score)}
            onShowResults={() => setIsTimerPaused(true)}
          />
        )}
      </main>
    </div>
  );
}
