"use client";

import { useState } from "react";
import { ContextChallengeDrill as ContextDrillType } from "@/lib/types";
import { scoreContextDrill } from "@/lib/workout-generator";
import {
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Props {
  drill: ContextDrillType;
  onComplete: (score: number) => void;
  onShowResults?: () => void;
  isAiGenerated?: boolean;
  isPractice?: boolean;
  onExit?: () => void;
}

export function ContextChallengeDrill({
  drill,
  onComplete,
  onShowResults,
  isAiGenerated = false,
  isPractice = false,
  onExit,
}: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<
    Record<string, number>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const isFinalQuestion = currentQuestionIndex === drill.questions.length - 1;
  const currentQuestion = drill.questions[currentQuestionIndex];
  const currentSelection = selectedIndices[currentQuestion.id];

  const handleNextOrSubmit = () => {
    if (isFinalQuestion) {
      const result = scoreContextDrill(drill, selectedIndices);
      setScore(result);
      setSubmitted(true);
      onShowResults?.();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const selectOption = (index: number) => {
    setSelectedIndices((prev) => ({
      ...prev,
      [currentQuestion.id]: index,
    }));
  };

  if (submitted) {
    return (
      <div className="space-y-6 animate-forge-in">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl border-2 border-foreground flex items-center justify-center"
            style={{ backgroundColor: "var(--color-context)", boxShadow: "var(--shadow-brutal-sm)" }}
          >
            <Target className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-black text-foreground tracking-tight">
            Context Challenge Results
          </h2>
        </div>

        <div
          className="rounded-xl bg-card border-2 border-foreground p-6 text-center"
          style={{ boxShadow: "var(--shadow-brutal)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {score === 100 ? (
              <CheckCircle2 className="w-7 h-7" style={{ color: "var(--color-verse-match)" }} />
            ) : (
              <XCircle className="w-7 h-7" style={{ color: "var(--color-context)" }} />
            )}
            <span className="text-4xl font-black text-foreground score-display">
              {score}/100
            </span>
          </div>
          <p className="text-muted-foreground text-xs mt-2 font-bold">
            {score === 100
              ? "Excellent! You know your Scripture context."
              : "Study the background of these passages."}
          </p>
        </div>

        <div className="space-y-3">
          {drill.questions.map((q, idx) => {
            const chosenIndex = selectedIndices[q.id];
            const isCorrect = chosenIndex === q.correctIndex;
            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-card border-2 border-foreground"
                style={{ boxShadow: "var(--shadow-brutal-sm)" }}
              >
                <div className="text-[10px] text-primary font-black mb-2 uppercase tracking-widest verse-ref">
                  Question {idx + 1} · {q.passage.reference}
                </div>
                <div className="text-sm text-foreground mb-3 font-medium">
                  {q.question}
                </div>
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-verse-match)" }} />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  )}
                  <div className="flex flex-col gap-1 text-sm">
                    {isCorrect ? (
                      <span className="font-bold" style={{ color: "var(--color-verse-match)" }}>
                        You got it right: &ldquo;{q.options[q.correctIndex]}&rdquo;
                      </span>
                    ) : (
                      <>
                        <span className="text-destructive line-through font-medium">
                          You chose:{" "}
                          {chosenIndex !== undefined
                            ? q.options[chosenIndex]
                            : "Skipped"}
                        </span>
                        <span className="font-bold" style={{ color: "var(--color-verse-match)" }}>
                          Correct answer: {q.options[q.correctIndex]}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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

  const getOptionStyle = (index: number) => {
    return index === currentSelection
      ? "border-primary bg-primary/10"
      : "border-foreground bg-card hover:-translate-y-0.5";
  };

  return (
    <div
      className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
      key={currentQuestionIndex}
    >
      {/* Drill header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl border-2 border-foreground flex items-center justify-center"
            style={{ backgroundColor: "var(--color-context)", boxShadow: "var(--shadow-brutal-sm)" }}
          >
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-foreground tracking-tight">
                Context Challenge
              </h2>
              {isAiGenerated && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-purple-100 text-purple-700 border border-purple-200 tracking-widest">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-bold">
              Question {currentQuestionIndex + 1} of {drill.questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Passage context */}
      <div
        className="rounded-xl bg-card border-2 border-foreground p-6 bg-lined"
        style={{ boxShadow: "var(--shadow-brutal)" }}
      >
        <div className="text-[10px] font-black text-primary mb-3 uppercase tracking-widest verse-ref">
          {currentQuestion.passage.reference}
        </div>
        <p className="text-foreground leading-relaxed font-medium">
          &ldquo;{currentQuestion.passage.text}&rdquo;
        </p>
      </div>

      {/* Question */}
      <div>
        <h3 className="text-lg font-black text-foreground mb-5 tracking-tight">
          {currentQuestion.question}
        </h3>

        <div className="space-y-2.5">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => selectOption(index)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-150 text-left ${getOptionStyle(index)}`}
              style={{
                boxShadow:
                  index === currentSelection
                    ? "var(--shadow-brutal-pink)"
                    : "var(--shadow-brutal-sm)",
              }}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border-2 border-foreground ${
                  index === currentSelection
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <span className="font-medium text-sm text-foreground">
                {option}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleNextOrSubmit}
        disabled={currentSelection === undefined}
        className={`w-full py-3.5 rounded-xl font-black text-sm transition-all duration-150 flex items-center justify-center gap-2 border-2 border-foreground uppercase tracking-wide ${
          currentSelection === undefined
            ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
            : "bg-primary text-primary-foreground btn-brutal"
        }`}
        style={{
          boxShadow:
            currentSelection === undefined
              ? "none"
              : "var(--shadow-brutal)",
        }}
      >
        {isFinalQuestion ? "Submit Answers" : "Next Question"}
        {!isFinalQuestion && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
