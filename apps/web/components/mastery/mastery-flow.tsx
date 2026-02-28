"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { BiblePassage, MasteryLevel } from "@/lib/types";
import { useMastery } from "@/lib/store";
import {
  ArrowLeft,
  CheckCircle2,
  Flame,
  Trophy,
  ChevronRight,
  Zap,
  Target,
  BookOpen,
  Sparkles,
  RotateCcw,
  PlayCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  passage: BiblePassage;
  initialLevel?: MasteryLevel;
}

export function MasteryFlow({ passage, initialLevel = 1 }: Props) {
  const { completeLevel } = useMastery();
  const [currentLevel, setCurrentLevel] = useState<MasteryLevel>(initialLevel);
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const CircularProgress = ({
    value,
    size = 120,
    strokeWidth = 12,
    color = "var(--primary)",
  }: {
    value: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black">{Math.round(value)}%</span>
          <span className="text-[10px] font-black uppercase text-muted-foreground">
            Accuracy
          </span>
        </div>
      </div>
    );
  };

  // Level Names & Descriptions
  const LEVELS = [
    {
      id: 1,
      name: "Read Mode",
      desc: "Read the verse carefully. Absorb the meaning.",
    },
    {
      id: 2,
      name: "Light Blanks",
      desc: "Type the missing words. 25% hidden.",
    },
    { id: 3, name: "Hard Blanks", desc: "Increased difficulty. 50% hidden." },
    {
      id: 4,
      name: "First Letter",
      desc: "Every word is hidden except its first letter.",
    },
    { id: 5, name: "Full Recall", desc: "Type the entire verse from memory." },
  ];

  const currentLevelInfo = LEVELS[currentLevel - 1];

  // Helper: Prepare verse text with blanks or first letters
  const prepareDisplay = () => {
    const words = passage.text.split(/\s+/);

    if (currentLevel === 1) return passage.text;

    if (currentLevel === 2 || currentLevel === 3) {
      const percentage = currentLevel === 2 ? 0.25 : 0.5;
      const seed = passage.reference.length; // consistent random
      return words
        .map((word, i) => {
          // pseudo-random based on index and seed
          const random = ((i * 1337 + seed) % 100) / 100;
          if (random < percentage) {
            return "____";
          }
          return word;
        })
        .join(" ");
    }

    if (currentLevel === 4) {
      return words
        .map((word) => {
          const match = word.match(/[a-zA-Z]/);
          if (match) {
            return match[0] + "_".repeat(word.length - 1);
          }
          return word;
        })
        .join(" ");
    }

    if (currentLevel === 5) {
      return ""; // Blank for full recall
    }

    return passage.text;
  };

  const calculateAccuracy = (input: string, target: string) => {
    const cleanInput = input.toLowerCase().replace(/[^\s\w]/g, "");
    const cleanTarget = target.toLowerCase().replace(/[^\s\w]/g, "");

    if (cleanTarget === cleanInput) return 100;

    const inputWords = cleanInput.split(/\s+/);
    const targetWords = cleanTarget.split(/\s+/);

    let matches = 0;
    targetWords.forEach((word, i) => {
      if (inputWords[i] === word) matches++;
    });

    return Math.round((matches / targetWords.length) * 100);
  };

  const handleSubmit = () => {
    const acc = calculateAccuracy(userInput, passage.text);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    setAccuracy(acc);
    setSubmitted(true);
    setIsCorrect(acc >= 90);

    // Save progress
    completeLevel(passage.reference, currentLevel, acc, timeTaken);

    if (currentLevel === 5 && acc >= 90) {
      setShowSuccess(true);
    }
  };

  const nextLevel = () => {
    if (showSuccess) {
      router.push("/dashboard");
      return;
    }

    if (currentLevel < 5) {
      setCurrentLevel((prev) => (prev + 1) as MasteryLevel);
      setUserInput("");
      setSubmitted(false);
      setIsCorrect(null);
      setStartTime(Date.now());
    } else {
      router.push("/dashboard");
    }
  };

  const resetLevel = () => {
    setUserInput("");
    setSubmitted(false);
    setIsCorrect(null);
    setStartTime(Date.now());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Stat Bar */}
      <div
        className="flex items-center justify-between px-6 py-4 rounded-2xl bg-card border-2 border-foreground"
        style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-muted-foreground uppercase">
              Mastery
            </span>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black">{currentLevel}/5</span>
            </div>
          </div>
          <div className="w-[100px] h-2 bg-muted rounded-full overflow-hidden border border-foreground/10">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(currentLevel / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="font-black text-primary uppercase text-sm">
          {passage.reference}
        </div>
      </div>

      {/* Level Title */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-foreground">
          {currentLevelInfo.name}
        </h2>
        <p className="text-muted-foreground font-bold">
          {currentLevelInfo.desc}
        </p>
      </div>

      {/* Training Area */}
      <div className="space-y-6">
        <div
          className="relative min-h-[200px] p-8 rounded-3xl bg-card border-2 border-foreground"
          style={{ boxShadow: "8px 8px 0px 0px var(--foreground)" }}
        >
          {currentLevel === 1 ? (
            <div className="text-2xl font-bold leading-relaxed text-center py-4">
              &ldquo;{passage.text}&rdquo;
            </div>
          ) : (
            <div className="space-y-6">
              {!submitted && currentLevel !== 5 && (
                <div className="text-xl font-bold leading-relaxed text-center text-muted-foreground/40 italic select-none">
                  {prepareDisplay()}
                </div>
              )}

              {!submitted ? (
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={
                    currentLevel === 5
                      ? "Type the entire verse here..."
                      : "Type the hidden words..."
                  }
                  className="w-full min-h-[150px] p-4 bg-background rounded-xl border-2 border-foreground text-foreground font-bold text-xl resize-none focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                  autoFocus
                />
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-xl border-2 border-foreground/10">
                    <div className="text-xs font-black text-muted-foreground uppercase mb-2">
                      Original
                    </div>
                    <div className="text-lg font-bold">
                      &ldquo;{passage.text}&rdquo;
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-xl border-2 ${isCorrect ? "bg-[#10B981]/10 border-[#10B981]" : "bg-[#EF4444]/10 border-[#EF4444]"}`}
                  >
                    <div className="text-xs font-black text-muted-foreground uppercase mb-2">
                      Your Recall ({accuracy}%)
                    </div>
                    <div className="text-lg font-bold">
                      {userInput || "(No input)"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex gap-4">
          {!submitted ? (
            <button
              onClick={currentLevel === 1 ? nextLevel : handleSubmit}
              className="flex-1 py-5 rounded-3xl bg-primary text-white font-black text-xl border-4 border-foreground hover:translate-y-[-4px] active:translate-y-0 transition-all flex items-center justify-center gap-3"
              style={{ boxShadow: "0px 8px 0px 0px var(--foreground)" }}
            >
              {currentLevel === 1 ? "Start Training" : "Verify Recall"}
              {currentLevel === 1 ? (
                <PlayCircle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </button>
          ) : (
            <>
              {!isCorrect && (
                <button
                  onClick={resetLevel}
                  className="px-8 py-5 rounded-3xl bg-muted text-foreground font-black text-xl border-4 border-foreground hover:translate-y-[-4px] active:translate-y-0 transition-all flex items-center justify-center gap-3"
                  style={{ boxShadow: "0px 8px 0px 0px var(--foreground)" }}
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={nextLevel}
                className={`flex-1 py-5 rounded-3xl font-black text-xl border-4 border-foreground hover:translate-y-[-4px] active:translate-y-0 transition-all flex items-center justify-center gap-3 ${
                  isCorrect
                    ? "bg-[#10B981] text-white"
                    : "bg-primary text-white"
                }`}
                style={{ boxShadow: "0px 8px 0px 0px var(--foreground)" }}
              >
                {currentLevel === 5 ? "Mastery Complete" : "Next Level"}
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rewards / Encouragement */}
      {submitted && isCorrect && !showSuccess && (
        <div className="flex items-center justify-center gap-4 animate-bounce">
          <div
            className="px-6 py-3 bg-[#F59E0B] text-white rounded-full font-black border-2 border-foreground flex items-center gap-2"
            style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
          >
            <Sparkles className="w-5 h-5" /> EXCELLENT RECALL
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="relative w-full max-w-lg bg-card border-4 border-foreground rounded-[40px] p-12 text-center shadow-[16px 16px 0px 0px_rgba(0,0,0,1)] flex flex-col items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-[#10B981] border-4 border-foreground flex items-center justify-center animate-bounce shadow-[4px 4px 0px 0px_var(--foreground)]">
              <Trophy className="w-12 h-12 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-black text-foreground">
                VERSE MASTERED
              </h2>
              <p className="text-xl font-bold text-muted-foreground uppercase tracking-widest">
                {passage.reference}
              </p>
            </div>

            <CircularProgress
              value={accuracy}
              size={160}
              strokeWidth={16}
              color="#10B981"
            />

            <div className="p-6 bg-muted rounded-3xl border-2 border-foreground w-full">
              <div className="text-xs font-black text-muted-foreground uppercase mb-2">
                Total Verses Mastered
              </div>
              <div className="text-4xl font-black text-foreground">
                LEVEL UP!
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-5 rounded-3xl bg-[#10B981] text-white font-black text-2xl border-4 border-foreground hover:translate-y-[-4px] active:translate-y-0 transition-all shadow-[0px 8px 0px 0px_var(--foreground)]"
            >
              MISSION ACCOMPLISHED
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
