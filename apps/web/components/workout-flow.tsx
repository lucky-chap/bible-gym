"use client";

import { useWorkout } from "@/lib/store";
import { MemorizationDrill } from "./drills/memorization-drill";
import { ContextChallengeDrill } from "./drills/context-drill";
import { VerseMatchDrill } from "./drills/verse-match-drill";
import { RearrangeDrillComponent } from "./drills/rearrange-drill";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

export function WorkoutFlow() {
  const { workout, currentDrillIndex, handleDrillComplete, exitWorkout } =
    useWorkout();
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

  const drillColors: Record<string, string> = {
    memorization: "var(--color-memorization)",
    context: "var(--color-context)",
    "verse-match": "var(--color-verse-match)",
    rearrange: "var(--color-rearrange)",
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
        <div
          className="w-16 h-16 rounded-2xl bg-primary border-2 border-foreground flex items-center justify-center animate-stamp"
          style={{ boxShadow: "var(--shadow-brutal-lg)" }}
        >
          <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Mission Accomplished!
          </h2>
          <p className="text-base text-muted-foreground font-bold">
            Saving your score to the database...
          </p>
          <p className="text-destructive font-bold text-sm animate-pulse">
            Please do not close this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-foreground">
        <div className="max-w-3xl mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={exitWorkout}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs font-black text-foreground uppercase tracking-wider">
                Drill {currentDrillIndex + 1}/{workout.drills.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-xs font-black text-primary-foreground bg-primary px-3 py-1 rounded-md border-2 border-foreground"
                style={{ boxShadow: "var(--shadow-brutal-press)" }}
              >
                {formatTime(secondsElapsed)}
              </span>
              <span className="text-xs font-bold text-muted-foreground hidden sm:inline">
                {drillLabels[currentDrill.type]}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 rounded-md bg-muted border-2 border-foreground overflow-hidden">
            <div
              className="h-full rounded-sm bg-primary transition-all duration-700 ease-out"
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
