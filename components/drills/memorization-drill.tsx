"use client";

import { useState, useRef, useEffect } from "react";
import { MemorizationDrill as MemDrillType } from "@/lib/types";
import { scoreMemorizationDrill } from "@/lib/workout-generator";
import { BookOpen, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface Props {
  drill: MemDrillType;
  onComplete: (score: number) => void;
  onShowResults?: () => void;
}

export function MemorizationDrill({ drill, onComplete, onShowResults }: Props) {
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

  useEffect(() => {
    // Auto-focus first blank
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
      inputRefs.current = {}; // reset refs for next question
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentIndex: number,
  ) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      // Find next blank input
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
      <div className="space-y-8 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Memorization Results
            </h2>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {score >= 70 ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            ) : (
              <XCircle className="w-8 h-8 text-amber-400" />
            )}
            <span className="text-4xl font-extrabold text-white">
              {score}/100
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {score === 100
              ? "Perfect! You know this passage by heart!"
              : "Keep training — you'll get stronger!"}
          </p>
        </div>

        {/* Show a recap of mistakes if any */}
        <div className="space-y-4">
          {drill.questions.map((q) => (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-xs text-orange-400 font-bold mb-2">
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
                        className={`inline-block px-1.5 py-0.5 rounded ${
                          correct
                            ? "text-emerald-400 bg-emerald-400/10"
                            : "text-red-400 bg-red-400/10"
                        }`}
                      >
                        {correct ? (
                          expected
                        ) : (
                          <s>{answers[q.id]?.[i] || "___"}</s>
                        )}
                        {!correct && (
                          <span className="ml-1 text-emerald-400">
                            {expected}
                          </span>
                        )}
                      </span>
                    );
                  }
                  return (
                    <span key={i} className="text-gray-400">
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onComplete(score)}
          className="w-full py-4 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] transition-all duration-300"
        >
          Next Drill →
        </button>
      </div>
    );
  }

  return (
    <div
      className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300"
      key={currentQuestionIndex}
    >
      {/* Drill header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Memorization Drill</h2>
            <p className="text-sm text-gray-400">
              Passage {currentQuestionIndex + 1} of {drill.questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Passage with blanks */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 md:p-8">
        <div className="text-sm font-medium text-orange-400 mb-4">
          {currentQuestion.passage.reference}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-3 text-lg leading-relaxed">
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
                    className="w-28 md:w-32 px-3 py-1.5 rounded-lg text-base font-medium text-center transition-all bg-black/40 border-2 border-white/10 text-white focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none"
                    placeholder="___"
                  />
                </span>
              );
            }
            return (
              <span key={i} className="text-gray-200">
                {word}
              </span>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleNextOrSubmit}
        className="w-full py-4 rounded-2xl bg-linear-to-r from-blue-500 to-cyan-500 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2"
      >
        {isFinalQuestion ? "Check Answers" : "Next Passage"}
        {!isFinalQuestion && <ArrowRight className="w-5 h-5" />}
      </button>
    </div>
  );
}
