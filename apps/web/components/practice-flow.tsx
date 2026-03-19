"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePractice } from "@/lib/store";
import { MemorizationDrill } from "./drills/memorization-drill";
import { ContextChallengeDrill } from "./drills/context-drill";
import { VerseMatchDrill } from "./drills/verse-match-drill";
import { RearrangeDrillComponent } from "./drills/rearrange-drill";
import { ArrowLeft, PlayCircle, RefreshCw, Sparkles, BookOpen } from "lucide-react";
import { Drill, PracticeConfig } from "@/lib/types";
import { generatePracticeDrillAction } from "@/app/actions/practice-drills";
import { Loader2 } from "lucide-react";

export function PracticeFlow() {
  const { practiceDrillType, practiceConfig, exitPractice, logPractice } =
    usePractice();
  const [currentDrill, setCurrentDrill] = useState<Drill | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const hasGeneratedRef = useRef(false);

  const generateNewDrill = useCallback(
    async (
      type:
        | "memorization"
        | "context"
        | "verse-match"
        | "rearrange"
        | "ai-themed"
        | null,
      config: PracticeConfig | null | undefined,
    ) => {
      if (!type || type === "ai-themed") return;
      setIsGenerating(true);
      setCurrentDrill(null);
      setIsAiGenerated(false);

      try {
        const result = await generatePracticeDrillAction(
          type,
          config ?? { by: "random", value: "" },
        );
        setSecondsElapsed(0);
        setIsTimerPaused(false);
        setCurrentDrill(result.drill);
        setIsAiGenerated(result.isAiGenerated);
      } catch (e) {
        console.error("Failed to generate drill", e);
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!practiceDrillType) {
      exitPractice();
      return;
    }
    if (hasGeneratedRef.current) return;
    hasGeneratedRef.current = true;
    generateNewDrill(practiceDrillType, practiceConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceDrillType]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentDrill && !isTimerPaused) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentDrill, isTimerPaused]);

  if (!practiceDrillType) return null;

  const handleDrillComplete = (score: number) => {
    hasGeneratedRef.current = true;
    logPractice(score);
    generateNewDrill(practiceDrillType, practiceConfig);
  };

  const handleSkip = () => {
    hasGeneratedRef.current = true;
    generateNewDrill(practiceDrillType, practiceConfig);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="h-full w-full">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-foreground">
        <div className="max-w-3xl mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            <button
              onClick={exitPractice}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Practice
            </button>
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-primary" />
              <span className="text-xs font-black text-foreground uppercase tracking-wider">
                Infinite Practice
              </span>
              {isAiGenerated && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-purple-100 text-purple-700 border border-purple-200 tracking-widest">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className="font-mono text-xs font-black text-primary-foreground bg-primary px-3 py-1 rounded-md border-2 border-foreground"
                style={{ boxShadow: "var(--shadow-brutal-press)" }}
              >
                {formatTime(secondsElapsed)}
              </span>
              <button
                onClick={handleSkip}
                className="hidden sm:flex items-center gap-1.5 text-xs font-black text-primary-foreground bg-foreground hover:bg-primary px-3 py-1.5 rounded-md border-2 border-foreground transition-colors uppercase tracking-wider"
                style={{ boxShadow: "var(--shadow-brutal-pink)" }}
              >
                <RefreshCw className="w-3 h-3" />
                Skip
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Drill Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div
              className="w-14 h-14 rounded-xl bg-primary border-2 border-foreground flex items-center justify-center animate-breathe"
              style={{ boxShadow: "var(--shadow-brutal)" }}
            >
              <Loader2 className="w-7 h-7 text-primary-foreground animate-spin" />
            </div>
            <div className="text-foreground font-black text-sm uppercase tracking-wider">
              {practiceConfig
                ? `Preparing ${practiceConfig.by === "random" ? "random" : practiceConfig.by} drill...`
                : "Preparing drill..."}
            </div>
          </div>
        ) : currentDrill ? (
          <>
            {currentDrill.type === "memorization" && (
              <MemorizationDrill
                drill={currentDrill}
                onComplete={handleDrillComplete}
                onShowResults={() => setIsTimerPaused(true)}
                method={practiceConfig?.method}
                isAiGenerated={isAiGenerated}
                isPractice={true}
                onExit={exitPractice}
              />
            )}
            {currentDrill.type === "context" && (
              <ContextChallengeDrill
                drill={currentDrill}
                onComplete={handleDrillComplete}
                onShowResults={() => setIsTimerPaused(true)}
                isAiGenerated={isAiGenerated}
                isPractice={true}
                onExit={exitPractice}
              />
            )}
            {currentDrill.type === "verse-match" && (
              <VerseMatchDrill
                drill={currentDrill}
                onComplete={handleDrillComplete}
                onShowResults={() => setIsTimerPaused(true)}
                isAiGenerated={isAiGenerated}
                isPractice={true}
                onExit={exitPractice}
              />
            )}
            {currentDrill.type === "rearrange" && (
              <RearrangeDrillComponent
                drill={currentDrill}
                onComplete={(score) => handleDrillComplete(score)}
                onShowResults={() => setIsTimerPaused(true)}
                isAiGenerated={isAiGenerated}
                isPractice={true}
                onExit={exitPractice}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16 space-y-4">
            <div className="w-14 h-14 rounded-xl bg-muted border-2 border-foreground/20 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-bold text-sm">
              Could not load drill. Please try again.
            </p>
            <button
              onClick={handleSkip}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-black text-sm border-2 border-foreground btn-brutal uppercase tracking-wide"
            >
              Retry
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
