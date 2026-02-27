"use client";

import { useState } from "react";
import { ContextChallengeDrill as ContextDrillType } from "@/lib/types";
import { scoreContextDrill } from "@/lib/workout-generator";
import { Target, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface Props {
  drill: ContextDrillType;
  onComplete: (score: number) => void;
  onShowResults?: () => void;
}

export function ContextChallengeDrill({
  drill,
  onComplete,
  onShowResults,
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
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Context Challenge Results
            </h2>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {score === 100 ? (
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
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="text-xs text-orange-400 font-bold mb-2">
                  Question {idx + 1} • {q.passage.reference}
                </div>
                <div className="text-sm text-gray-200 mb-3">{q.question}</div>
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex flex-col gap-1 text-sm">
                    {isCorrect ? (
                      <span className="text-emerald-400 font-medium">
                        You got it right: "{q.options[q.correctIndex]}"
                      </span>
                    ) : (
                      <>
                        <span className="text-red-400 line-through">
                          You chose:{" "}
                          {chosenIndex !== undefined
                            ? q.options[chosenIndex]
                            : "Skipped"}
                        </span>
                        <span className="text-emerald-400 font-medium">
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
          className="w-full py-4 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] transition-all duration-300"
        >
          Next Drill →
        </button>
      </div>
    );
  }

  const getOptionStyle = (index: number) => {
    return index === currentSelection
      ? "border-orange-500/50 bg-orange-500/10 ring-2 ring-orange-500/20"
      : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10";
  };

  return (
    <div
      className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300"
      key={currentQuestionIndex}
    >
      {/* Drill header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Context Challenge</h2>
            <p className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {drill.questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Passage context */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <div className="text-sm font-medium text-orange-400 mb-3">
          {currentQuestion.passage.reference}
        </div>
        <p className="text-gray-300 leading-relaxed italic">
          &ldquo;{currentQuestion.passage.text}&rdquo;
        </p>
      </div>

      {/* Question */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => selectOption(index)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 text-left ${getOptionStyle(index)}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  index === currentSelection
                    ? "bg-orange-500/20 text-orange-400"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <span
                className={`font-medium ${index === currentSelection ? "text-white" : "text-gray-300"}`}
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
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
          currentSelection === undefined
            ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5"
            : "bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01]"
        }`}
      >
        {isFinalQuestion ? "Submit Answers" : "Next Question"}
        {!isFinalQuestion && <ArrowRight className="w-5 h-5" />}
      </button>
    </div>
  );
}
