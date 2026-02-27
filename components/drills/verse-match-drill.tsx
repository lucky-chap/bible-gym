"use client";

import { useState, useCallback } from "react";
import { VerseMatchDrill as VerseMatchDrillType } from "@/lib/types";
import { scoreVerseMatchDrill } from "@/lib/workout-generator";
import { Zap, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

interface Props {
  drill: VerseMatchDrillType;
  onComplete: (score: number) => void;
  onShowResults?: () => void;
}

export function VerseMatchDrill({ drill, onComplete, onShowResults }: Props) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Shuffled text options
  const [shuffledTexts] = useState(() => {
    const texts = drill.pairs.map((p) => p.text);
    for (let i = texts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [texts[i], texts[j]] = [texts[j], texts[i]];
    }
    return texts;
  });

  const handleRefClick = useCallback(
    (ref: string) => {
      if (submitted) return;
      setSelectedRef((prev) => (prev === ref ? null : ref));
    },
    [submitted],
  );

  const handleTextClick = useCallback(
    (text: string) => {
      if (submitted || !selectedRef) return;

      // Check if this text is already matched to something else
      const existingRef = Object.entries(matches).find(
        ([, v]) => v === text,
      )?.[0];
      if (existingRef) {
        // Remove old match
        const newMatches = { ...matches };
        delete newMatches[existingRef];
        newMatches[selectedRef] = text;
        setMatches(newMatches);
      } else {
        setMatches((prev) => ({ ...prev, [selectedRef]: text }));
      }
      setSelectedRef(null);
    },
    [submitted, selectedRef, matches],
  );

  const handleSubmit = () => {
    const result = scoreVerseMatchDrill(drill, matches);
    setScore(result);
    setSubmitted(true);
    onShowResults?.();
  };

  const handleReset = () => {
    setMatches({});
    setSelectedRef(null);
  };

  const isTextMatched = (text: string) => {
    return Object.values(matches).includes(text);
  };

  const getRefMatchedText = (ref: string) => {
    return matches[ref] || null;
  };

  const isCorrectMatch = (ref: string) => {
    if (!submitted) return null;
    const pair = drill.pairs.find((p) => p.reference === ref);
    return pair ? matches[ref] === pair.text : false;
  };

  return (
    <div className="space-y-8">
      {/* Drill header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Zap className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Verse Match</h2>
          <p className="text-sm text-gray-500">
            Match each reference to its verse
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
        <p className="text-sm text-gray-400">
          <span className="text-emerald-400 font-semibold">How to play:</span>{" "}
          Tap a reference on the left, then tap its matching verse text on the
          right.
        </p>
      </div>

      {/* Match Area */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* References */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            References
          </div>
          {drill.pairs.map((pair) => {
            const matched = getRefMatchedText(pair.reference);
            const correct = isCorrectMatch(pair.reference);

            return (
              <button
                key={pair.reference}
                onClick={() => handleRefClick(pair.reference)}
                disabled={submitted}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                  submitted
                    ? correct
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-red-500/40 bg-red-500/10"
                    : selectedRef === pair.reference
                      ? "border-emerald-500/50 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                      : matched
                        ? "border-cyan-500/30 bg-cyan-500/5"
                        : "border-white/5 bg-white/[0.03] hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">
                    {pair.reference}
                  </span>
                  {submitted &&
                    (correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ))}
                  {!submitted && matched && (
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>
                {matched && (
                  <div className="mt-2 text-xs text-gray-400 line-clamp-2">
                    → {matched.slice(0, 50)}...
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Verse Texts */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Verse Texts
          </div>
          {shuffledTexts.map((text) => {
            const matched = isTextMatched(text);

            return (
              <button
                key={text}
                onClick={() => handleTextClick(text)}
                disabled={submitted || !selectedRef}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                  submitted
                    ? "border-white/5 bg-white/[0.02]"
                    : matched
                      ? "border-cyan-500/30 bg-cyan-500/5 opacity-60"
                      : selectedRef
                        ? "border-white/5 bg-white/[0.03] hover:border-emerald-500/30 hover:bg-emerald-500/5 cursor-pointer"
                        : "border-white/5 bg-white/[0.03] opacity-70"
                }`}
              >
                <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset button */}
      {!submitted && Object.keys(matches).length > 0 && (
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors mx-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Matches
        </button>
      )}

      {/* Results or Submit */}
      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {score >= 75 ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-amber-400" />
              )}
              <span className="text-2xl font-extrabold text-white">
                {score}/100
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              {score === 100
                ? "Perfect matching! Your verse recall is strong!"
                : score >= 75
                  ? "Well done! Almost all matches correct."
                  : score >= 50
                    ? "Good effort. Keep studying these verses."
                    : "More training needed — review these passages!"}
            </p>
          </div>

          <button
            onClick={() => onComplete(score)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] transition-all duration-300"
          >
            Complete Workout →
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(matches).length < drill.pairs.length}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
            Object.keys(matches).length < drill.pairs.length
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01]"
          }`}
        >
          {Object.keys(matches).length < drill.pairs.length
            ? `Match all verses (${Object.keys(matches).length}/${drill.pairs.length})`
            : "Check Matches"}
        </button>
      )}
    </div>
  );
}
