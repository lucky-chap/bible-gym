"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePractice } from "@/lib/store";
import { MemorizationDrill } from "./drills/memorization-drill";
import { ContextChallengeDrill } from "./drills/context-drill";
import { VerseMatchDrill } from "./drills/verse-match-drill";
import { RearrangeDrillComponent } from "./drills/rearrange-drill";
import { ArrowLeft, PlayCircle, RefreshCw, Sparkles } from "lucide-react";
import { Drill, PracticeConfig } from "@/lib/types";
import { generatePracticeDrillAction } from "@/app/actions/practice-drills";
import { Loader2 } from "lucide-react";

export function PracticeFlow() {
  const { practiceDrillType, practiceConfig, exitPractice } = usePractice();
  const [currentDrill, setCurrentDrill] = useState<Drill | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  // Guard so localStorage re-hydration doesn't re-trigger generation mid-session
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
        // Always attempt AI + Bible API — server action handles fallback internally
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
    // Only generate once — prevent localStorage re-hydration from re-triggering
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

  const handleDrillComplete = (_score: number) => {
    hasGeneratedRef.current = true; // allow next generation
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
      <header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
        <div className="max-w-3xl mx-auto px-6 py-4">
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
              <span className="text-sm font-bold text-foreground">
                Infinite Practice
              </span>
              {isAiGenerated && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-sm font-bold text-white bg-primary px-3 py-1 rounded-full border-2 border-foreground"
                style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
              >
                {formatTime(secondsElapsed)}
              </span>
              <button
                onClick={handleSkip}
                className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-white bg-foreground hover:bg-primary px-3 py-1.5 rounded-full border-2 border-foreground transition-colors"
                style={{ boxShadow: "2px 2px 0px 0px var(--primary)" }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
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
              className="w-16 h-16 rounded-2xl bg-primary border-2 border-foreground flex items-center justify-center animate-pulse"
              style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
            >
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="text-foreground font-bold">
              {practiceConfig
                ? `Preparing ${practiceConfig.by === "random" ? "random" : practiceConfig.by} drill with AI...`
                : "Preparing drill with AI..."}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
              <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
              Powered by Gemini + Bible API
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
              />
            )}
            {currentDrill.type === "context" && (
              <ContextChallengeDrill
                drill={currentDrill}
                onComplete={handleDrillComplete}
                onShowResults={() => setIsTimerPaused(true)}
                isAiGenerated={isAiGenerated}
              />
            )}
            {currentDrill.type === "verse-match" && (
              <VerseMatchDrill
                drill={currentDrill}
                onComplete={handleDrillComplete}
                onShowResults={() => setIsTimerPaused(true)}
                isAiGenerated={isAiGenerated}
              />
            )}
            {currentDrill.type === "rearrange" && (
              <RearrangeDrillComponent
                drill={currentDrill}
                onComplete={(score) => handleDrillComplete(score)}
                onShowResults={() => setIsTimerPaused(true)}
                isAiGenerated={isAiGenerated}
              />
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground font-bold py-12">
            Could not load drill. Please try again.
          </div>
        )}
      </main>
    </div>
  );
}
