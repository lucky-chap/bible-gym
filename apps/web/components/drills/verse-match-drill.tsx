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
        <div
          className="w-12 h-12 rounded-2xl bg-[#10B981] border-2 border-foreground flex items-center justify-center"
          style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
        >
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Verse Match</h2>
          <p className="text-sm text-muted-foreground font-medium">
            Match each reference to its verse
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div
        className="rounded-xl bg-card border-2 border-foreground p-4"
        style={{ boxShadow: "3px 3px 0px 0px #10B981" }}
      >
        <p className="text-sm text-foreground font-medium">
          <span className="text-[#10B981] font-black">How to play:</span> Tap a
          reference on the left, then tap its matching verse text on the right.
        </p>
      </div>

      {/* Match Area */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* References */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
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
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  submitted
                    ? correct
                      ? "border-foreground bg-[#D1FAE5]"
                      : "border-foreground bg-red-50"
                    : selectedRef === pair.reference
                      ? "border-[#10B981] bg-[#10B981]/10"
                      : matched
                        ? "border-[#3B82F6] bg-[#3B82F6]/5"
                        : "border-foreground bg-card hover:translate-y-[-2px]"
                }`}
                style={{
                  boxShadow: submitted
                    ? correct
                      ? "3px 3px 0px 0px #10B981"
                      : "3px 3px 0px 0px #EF4444"
                    : selectedRef === pair.reference
                      ? "3px 3px 0px 0px #10B981"
                      : "3px 3px 0px 0px var(--foreground)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-foreground text-sm">
                    {pair.reference}
                  </span>
                  {submitted &&
                    (correct ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ))}
                  {!submitted && matched && (
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-foreground" />
                  )}
                </div>
                {matched && (
                  <div className="mt-2 text-xs text-muted-foreground line-clamp-2 font-medium">
                    → {matched.slice(0, 50)}...
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Verse Texts */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Verse Texts
          </div>
          {shuffledTexts.map((text) => {
            const matched = isTextMatched(text);

            return (
              <button
                key={text}
                onClick={() => handleTextClick(text)}
                disabled={submitted || !selectedRef}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  submitted
                    ? "border-foreground bg-background"
                    : matched
                      ? "border-[#3B82F6] bg-[#3B82F6]/5 opacity-60"
                      : selectedRef
                        ? "border-foreground bg-card hover:border-[#10B981] hover:bg-[#10B981]/5 hover:translate-y-[-2px] cursor-pointer"
                        : "border-foreground/30 bg-background opacity-70"
                }`}
                style={{
                  boxShadow:
                    submitted || matched || !selectedRef
                      ? "none"
                      : "3px 3px 0px 0px var(--foreground)",
                }}
              >
                <p className="text-sm text-foreground leading-relaxed font-medium">
                  {text}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset button */}
      {!submitted && Object.keys(matches).length > 0 && (
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-bold transition-colors mx-auto"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Matches
        </button>
      )}

      {/* Results or Submit */}
      {submitted ? (
        <div className="space-y-4">
          <div
            className="rounded-2xl bg-card border-2 border-foreground p-6 text-center"
            style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {score >= 75 ? (
                <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
              ) : (
                <XCircle className="w-6 h-6 text-[#F59E0B]" />
              )}
              <span className="text-2xl font-black text-foreground">
                {score}/100
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-medium">
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
            className="w-full py-4 rounded-full bg-primary text-white font-bold text-base border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
            style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
          >
            Complete Workout →
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(matches).length < drill.pairs.length}
          className={`w-full py-4 rounded-full font-bold text-base transition-all duration-200 border-2 border-foreground ${
            Object.keys(matches).length < drill.pairs.length
              ? "bg-muted text-[#B0AAA2] cursor-not-allowed"
              : "bg-[#10B981] text-white hover:translate-x-[-2px] hover:translate-y-[-2px]"
          }`}
          style={{
            boxShadow:
              Object.keys(matches).length < drill.pairs.length
                ? "none"
                : "4px 4px 0px 0px var(--foreground)",
          }}
        >
          {Object.keys(matches).length < drill.pairs.length
            ? `Match all verses (${Object.keys(matches).length}/${drill.pairs.length})`
            : "Check Matches"}
        </button>
      )}
    </div>
  );
}
