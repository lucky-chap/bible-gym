"use client";

import { useState, useRef, useEffect } from "react";
import { MemorizationDrill as MemDrillType } from "@/lib/types";
import { scoreMemorizationDrill } from "@/lib/workout-generator";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Props {
  drill: MemDrillType;
  onComplete: (score: number) => void;
  onShowResults?: () => void;
  method?: "blanks" | "first-letter";
  isAiGenerated?: boolean;
  isPractice?: boolean;
  onExit?: () => void;
}

export function MemorizationDrill({
  drill,
  onComplete,
  onShowResults,
  method = "blanks",
  isAiGenerated = false,
  isPractice = false,
  onExit,
}: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, Record<number, string>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const isFinalQuestion = currentQuestionIndex === drill.questions.length - 1;
  const currentQuestion = drill.questions[currentQuestionIndex];
  const words = currentQuestion.passage.text.split(" ");
  const blankedIndices = new Set(
    currentQuestion.blankedWords.map((b) => b.index),
  );

  const formatWord = (word: string) => {
    if (method !== "first-letter") return word;
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    if (cleanWord.length <= 1) return word;

    const firstLetterMatch = word.match(/[a-zA-Z]/);
    if (!firstLetterMatch) return word;

    const firstCharIndex = word.indexOf(firstLetterMatch[0]);
    const firstLetter = word.charAt(firstCharIndex);
    const leadingPunctuation = word.substring(0, firstCharIndex);

    const trailingPunctuationMatch = word.match(/[^a-zA-Z]+$/);
    const trailingPunctuation = trailingPunctuationMatch
      ? trailingPunctuationMatch[0]
      : "";

    return leadingPunctuation + firstLetter + "_" + trailingPunctuation;
  };

  useEffect(() => {
    const firstBlank = currentQuestion.blankedWords[0];
    if (firstBlank && inputRefs.current[firstBlank.index] && !submitted) {
      inputRefs.current[firstBlank.index]?.focus();
    }
  }, [currentQuestionIndex, currentQuestion.blankedWords, submitted]);

  const handleNextOrSubmit = () => {
    if (isFinalQuestion) {
      const result = scoreMemorizationDrill(drill, answers);
      setScore(result);
      setSubmitted(true);
      onShowResults?.();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      inputRefs.current = {};
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentIndex: number,
  ) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      const currentPos = currentQuestion.blankedWords.findIndex(
        (b) => b.index === currentIndex,
      );
      const nextBlank = currentQuestion.blankedWords[currentPos + 1];
      if (nextBlank && inputRefs.current[nextBlank.index]) {
        inputRefs.current[nextBlank.index]?.focus();
      } else if (e.key === "Enter") {
        handleNextOrSubmit();
      }
    }
  };

  const isCorrect = (questionId: string, blankIndex: number) => {
    if (!submitted) return null;
    const q = drill.questions.find((q) => q.id === questionId);
    if (!q) return null;
    const blank = q.blankedWords.find((b) => b.index === blankIndex);
    if (!blank) return null;
    const questionAnswers = answers[questionId] || {};
    const answer = (questionAnswers[blankIndex] || "").trim().toLowerCase();
    const expected = blank.word
      .replace(/[^a-zA-Z]/g, "")
      .trim()
      .toLowerCase();
    return answer === expected;
  };

  const updateAnswer = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {}),
        [index]: value,
      },
    }));
  };

  if (submitted) {
    return (
      <div className="space-y-6 animate-forge-in">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl bg-[var(--color-memorization)] border-2 border-foreground flex items-center justify-center"
            style={{ boxShadow: "var(--shadow-brutal-sm)" }}
          >
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground tracking-tight">
              Memorization Results
            </h2>
          </div>
        </div>

        <div
          className="rounded-xl bg-card border-2 border-foreground p-6 text-center"
          style={{ boxShadow: "var(--shadow-brutal)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {score >= 70 ? (
              <CheckCircle2 className="w-7 h-7 text-[var(--color-verse-match)]" />
            ) : (
              <XCircle className="w-7 h-7 text-[var(--color-context)]" />
            )}
            <span className="text-4xl font-black text-foreground score-display">
              {score}/100
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-2 font-bold">
            {score === 100
              ? "Perfect! You know this passage by heart!"
              : "Keep training — you'll get stronger!"}
          </p>
        </div>

        {/* Recap */}
        <div className="space-y-3">
          {drill.questions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-card border-2 border-foreground bg-lined"
              style={{ boxShadow: "var(--shadow-brutal-sm)" }}
            >
              <div className="text-[10px] text-primary font-black mb-2 uppercase tracking-widest verse-ref">
                {q.passage.reference}
              </div>
              <div className="flex flex-wrap items-baseline gap-x-1 gap-y-1 text-sm leading-relaxed">
                {q.passage.text.split(" ").map((word, i) => {
                  if (q.blankedWords.some((b) => b.index === i)) {
                    const expected =
                      q.blankedWords.find((b) => b.index === i)?.word || "";
                    const correct = isCorrect(q.id, i);
                    return (
                      <span
                        key={i}
                        className={`inline-block px-1.5 py-0.5 rounded-md font-bold text-xs ${
                          correct
                            ? "text-[var(--color-verse-match)] bg-[#D6F5E5]"
                            : "text-destructive bg-red-50"
                        }`}
                      >
                        {correct ? (
                          expected
                        ) : (
                          <s>{answers[q.id]?.[i] || "___"}</s>
                        )}
                        {!correct && (
                          <span className="ml-1 text-[var(--color-verse-match)]">
                            {expected}
                          </span>
                        )}
                      </span>
                    );
                  }
                  return (
                    <span key={i} className="text-muted-foreground">
                      {formatWord(word)}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 w-full">
          {isPractice && onExit && (
            <button
              onClick={onExit}
              className="w-full py-3.5 rounded-xl bg-card text-foreground font-black text-sm border-2 border-foreground btn-brutal"
            >
              Go Back
            </button>
          )}
          <button
            onClick={() => onComplete(score)}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-sm border-2 border-foreground btn-brutal uppercase tracking-wide"
          >
            {isPractice ? "Play Again →" : "Next Drill →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
      key={currentQuestionIndex}
    >
      {/* Drill header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl bg-[var(--color-memorization)] border-2 border-foreground flex items-center justify-center"
            style={{ boxShadow: "var(--shadow-brutal-sm)" }}
          >
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-foreground tracking-tight">
                Memorization Drill
              </h2>
              {isAiGenerated && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-[var(--color-mastery)]/10 text-[var(--color-mastery)] border border-[var(--color-mastery)]/30 tracking-widest">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-bold">
              Passage {currentQuestionIndex + 1} of {drill.questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Passage with blanks */}
      <div
        className="rounded-xl bg-card border-2 border-foreground p-6 md:p-7 bg-lined"
        style={{ boxShadow: "var(--shadow-brutal)" }}
      >
        <div className="text-[10px] font-black text-primary mb-4 uppercase tracking-widest verse-ref">
          {currentQuestion.passage.reference}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-3 text-base leading-relaxed">
          {words.map((word, i) => {
            if (blankedIndices.has(i)) {
              const currentQAnswers = answers[currentQuestion.id] || {};
              return (
                <span key={i} className="inline-flex items-center gap-1">
                  <input
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    value={currentQAnswers[i] || ""}
                    onChange={(e) => updateAnswer(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    className="w-28 md:w-32 px-3 py-1.5 rounded-lg text-sm font-bold text-center transition-all bg-background border-2 border-foreground text-foreground focus:ring-2 focus:ring-primary outline-none"
                    placeholder={
                      method === "first-letter" ? formatWord(word) : "___"
                    }
                  />
                </span>
              );
            }
            return (
              <span key={i} className="text-foreground font-medium">
                {formatWord(word)}
              </span>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleNextOrSubmit}
        className="w-full py-3.5 rounded-xl bg-[var(--color-memorization)] text-white font-black text-sm border-2 border-foreground btn-brutal flex items-center justify-center gap-2 uppercase tracking-wide"
      >
        {isFinalQuestion ? "Check Answers" : "Next Passage"}
        {!isFinalQuestion && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
