"use client";

import { useEffect, useState } from "react";
import { usePractice } from "@/lib/store";
import { MemorizationDrill } from "./drills/memorization-drill";
import { ContextChallengeDrill } from "./drills/context-drill";
import { VerseMatchDrill } from "./drills/verse-match-drill";
import { ArrowLeft, PlayCircle, RefreshCw } from "lucide-react";
import {
  generateMemorizationDrill,
  generateContextDrill,
  generateVerseMatchDrill,
} from "@/lib/workout-generator";
import { BIBLE_PASSAGES } from "@/lib/bible-data";
import { Drill } from "@/lib/types";
import { generatePracticeDrillAction } from "@/app/actions/practice-drills";
import { Loader2 } from "lucide-react";

export function PracticeFlow() {
  const { practiceDrillType, practiceConfig, exitPractice } = usePractice();
  const [currentDrill, setCurrentDrill] = useState<Drill | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNewDrill = async () => {
    setIsGenerating(true);
    setCurrentDrill(null); // Force unmount to reset state

    try {
      if (
        practiceConfig &&
        practiceDrillType &&
        practiceDrillType !== "ai-themed"
      ) {
        const drill = await generatePracticeDrillAction(
          practiceDrillType,
          practiceConfig,
        );
        setSecondsElapsed(0);
        setIsTimerPaused(false);
        setCurrentDrill(drill);
      } else {
        // Fallback to local random passages
        const randomPassages = [...BIBLE_PASSAGES]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        let drill: Drill;
        if (practiceDrillType === "memorization") {
          drill = generateMemorizationDrill(randomPassages);
        } else if (practiceDrillType === "context") {
          drill = generateContextDrill(randomPassages);
        } else {
          drill = generateVerseMatchDrill();
        }

        setSecondsElapsed(0);
        setIsTimerPaused(false);
        setCurrentDrill(drill);
      }
    } catch (e) {
      console.error("Failed to generate drill", e);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!practiceDrillType) {
      exitPractice();
      return;
    }
    generateNewDrill();
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

  const drillLabels = {
    memorization: "Memorization Practice",
    context: "Context Challenge Practice",
    "verse-match": "Verse Match Practice",
  };

  const handleDrillComplete = (score: number) => {
    // In practice mode, we just show them how they did, no state saving needed
    // The drill component handles showing its result screen.
    // They can click "Next Drill ->" which is wired to this callback.
    // So here we just generate a new practice drill.
    generateNewDrill();
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
              <PlayCircle className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-bold text-foreground">
                Infinite Practice
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-sm font-bold text-white bg-primary px-3 py-1 rounded-full border-2 border-foreground"
                style={{ boxShadow: "2px 2px 0px 0px var(--foreground)" }}
              >
                {formatTime(secondsElapsed)}
              </span>
              <button
                onClick={generateNewDrill}
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
                ? `Preparing ${practiceConfig.by} drill...`
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
