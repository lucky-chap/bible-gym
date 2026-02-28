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
}

export function ContextChallengeDrill({
  drill,
  onComplete,
  onShowResults,
  isAiGenerated = false,
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
      <div className="space-y-8 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl bg-[#F59E0B] border-2 border-foreground flex items-center justify-center"
            style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
          >
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Context Challenge Results
            </h2>
          </div>
        </div>

        <div
          className="rounded-2xl bg-card border-2 border-foreground p-6 text-center"
          style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {score === 100 ? (
              <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
            ) : (
              <XCircle className="w-8 h-8 text-[#F59E0B]" />
            )}
            <span className="text-4xl font-black text-foreground">
              {score}/100
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-2 font-medium">
            {score === 100
              ? "Excellent! You know your Scripture context."
              : "Study the background of these passages."}
          </p>
        </div>

        <div className="space-y-4">
          {drill.questions.map((q, idx) => {
            const chosenIndex = selectedIndices[q.id];
            const isCorrect = chosenIndex === q.correctIndex;
            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-card border-2 border-foreground"
                style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
              >
                <div className="text-xs text-primary font-black mb-2">
                  Question {idx + 1} • {q.passage.reference}
                </div>
                <div className="text-sm text-foreground mb-3 font-medium">
                  {q.question}
                </div>
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <div className="flex flex-col gap-1 text-sm">
                    {isCorrect ? (
                      <span className="text-[#10B981] font-bold">
                        You got it right: &ldquo;{q.options[q.correctIndex]}
                        &rdquo;
                      </span>
                    ) : (
                      <>
                        <span className="text-red-500 line-through font-medium">
                          You chose:{" "}
                          {chosenIndex !== undefined
                            ? q.options[chosenIndex]
                            : "Skipped"}
                        </span>
                        <span className="text-[#10B981] font-bold">
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

        <button
          onClick={() => onComplete(score)}
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-base border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
          style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
        >
          Next Drill →
        </button>
      </div>
    );
  }

  const getOptionStyle = (index: number) => {
    return index === currentSelection
      ? "border-[var(--primary)] bg-primary/10"
      : "border-foreground bg-card hover:translate-y-[-2px]";
  };

  return (
    <div
      className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300"
      key={currentQuestionIndex}
    >
      {/* Drill header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl bg-[#F59E0B] border-2 border-foreground flex items-center justify-center"
            style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
          >
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                Context Challenge
              </h2>
              {isAiGenerated && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Question {currentQuestionIndex + 1} of {drill.questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Passage context */}
      <div
        className="rounded-2xl bg-card border-2 border-foreground p-6"
        style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
      >
        <div className="text-sm font-black text-primary mb-3">
          {currentQuestion.passage.reference}
        </div>
        <p className="text-foreground leading-relaxed  font-medium">
          &ldquo;{currentQuestion.passage.text}&rdquo;
        </p>
      </div>

      {/* Question */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => selectOption(index)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${getOptionStyle(index)}`}
              style={{
                boxShadow:
                  index === currentSelection
                    ? "3px 3px 0px 0px var(--primary)"
                    : "3px 3px 0px 0px var(--foreground)",
              }}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border-2 border-foreground ${
                  index === currentSelection
                    ? "bg-primary text-white"
                    : "bg-background text-foreground"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <span
                className={`font-medium ${index === currentSelection ? "text-foreground" : "text-foreground"}`}
              >
                {option}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleNextOrSubmit}
        disabled={currentSelection === undefined}
        className={`w-full py-4 rounded-full font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 border-2 border-foreground ${
          currentSelection === undefined
            ? "bg-muted text-[#B0AAA2] cursor-not-allowed"
            : "bg-primary text-white hover:translate-x-[-2px] hover:translate-y-[-2px]"
        }`}
        style={{
          boxShadow:
            currentSelection === undefined
              ? "none"
              : "4px 4px 0px 0px var(--foreground)",
        }}
      >
        {isFinalQuestion ? "Submit Answers" : "Next Question"}
        {!isFinalQuestion && <ArrowRight className="w-5 h-5" />}
      </button>
    </div>
  );
}
