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

export function PracticeFlow() {
  const { practiceDrillType, exitPractice } = usePractice();
  const [currentDrill, setCurrentDrill] = useState<Drill | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const generateNewDrill = () => {
    // Pick 3 random passages for the drill
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

    // Reset timer and set the drill
    setSecondsElapsed(0);
    setIsTimerPaused(false);
    setCurrentDrill(null); // Force unmount to reset state
    setTimeout(() => setCurrentDrill(drill), 0);
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

  if (!practiceDrillType || !currentDrill) return null;

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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={exitPractice}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit Practice
            </button>
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-gray-400">
                Infinite Practice
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-orange-400 border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 rounded-md">
                {formatTime(secondsElapsed)}
              </span>
              <button
                onClick={generateNewDrill}
                className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-3 py-1 rounded-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Skip Let's go
              </button>
            </div>
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
