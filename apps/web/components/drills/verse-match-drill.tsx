"use client";

import { useState, useCallback } from "react";
import { VerseMatchDrill as VerseMatchDrillType } from "@/lib/types";
import { scoreVerseMatchDrill } from "@/lib/workout-generator";
import { Zap, CheckCircle2, XCircle, RotateCcw, Sparkles } from "lucide-react";

interface Props {
  drill: VerseMatchDrillType;
  onComplete: (score: number) => void;
  onShowResults?: () => void;
  isAiGenerated?: boolean;
  isPractice?: boolean;
  onExit?: () => void;
}

export function VerseMatchDrill({
  drill,
  onComplete,
  onShowResults,
  isAiGenerated = false,
  isPractice = false,
  onExit,
}: Props) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

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
      const existingRef = Object.entries(matches).find(
        ([, v]) => v === text,
      )?.[0];
      if (existingRef) {
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
    <div className="space-y-6">
      {/* Drill header */}
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl border-2 border-foreground flex items-center justify-center"
          style={{ backgroundColor: "var(--color-verse-match)", boxShadow: "var(--shadow-brutal-sm)" }}
        >
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-foreground tracking-tight">Verse Match</h2>
            {isAiGenerated && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-purple-100 text-purple-700 border border-purple-200 tracking-widest">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-bold">
            Match each reference to its verse
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div
        className="rounded-lg bg-card border-2 border-foreground p-3.5"
        style={{ boxShadow: "var(--shadow-brutal-green)" }}
      >
        <p className="text-xs text-foreground font-medium">
          <span className="font-black" style={{ color: "var(--color-verse-match)" }}>How to play:</span>{" "}
          Tap a reference on the left, then tap its matching verse text on the right.
        </p>
      </div>

      {/* Match Area */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* References */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 pl-1">
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
                className={`w-full p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                  submitted
                    ? correct
                      ? "border-foreground bg-[#D6F5E5]"
                      : "border-foreground bg-red-50"
                    : selectedRef === pair.reference
                      ? "border-foreground bg-[#D6F5E5]/50"
                      : matched
                        ? "border-foreground/50 bg-secondary/50"
                        : "border-foreground bg-card hover:-translate-y-0.5"
                }`}
                style={{
                  boxShadow: submitted
                    ? correct
                      ? "var(--shadow-brutal-green)"
                      : "3px 3px 0px 0px #D93636"
                    : selectedRef === pair.reference
                      ? "var(--shadow-brutal-green)"
                      : "var(--shadow-brutal-sm)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-foreground text-sm verse-ref">
                    {pair.reference}
                  </span>
                  {submitted &&
                    (correct ? (
                      <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-verse-match)" }} />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    ))}
                  {!submitted && matched && (
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-foreground" style={{ backgroundColor: "var(--color-memorization)" }} />
                  )}
                </div>
                {matched && (
                  <div className="mt-1.5 text-[10px] text-muted-foreground line-clamp-2 font-medium">
                    → {matched.slice(0, 50)}...
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Verse Texts */}
        <div className="space-y-2.5">
          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 pl-1">
            Verse Texts
          </div>
          {shuffledTexts.map((text) => {
            const matched = isTextMatched(text);

            return (
              <button
                key={text}
                onClick={() => handleTextClick(text)}
                disabled={submitted || !selectedRef}
                className={`w-full p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                  submitted
                    ? "border-foreground bg-background"
                    : matched
                      ? "border-foreground/30 bg-secondary/30 opacity-60"
                      : selectedRef
                        ? "border-foreground bg-card hover:bg-[#D6F5E5]/30 hover:-translate-y-0.5 cursor-pointer"
                        : "border-foreground/20 bg-background opacity-70"
                }`}
                style={{
                  boxShadow:
                    submitted || matched || !selectedRef
                      ? "none"
                      : "var(--shadow-brutal-sm)",
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
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors mx-auto uppercase tracking-wider"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Matches
        </button>
      )}

      {/* Results or Submit */}
      {submitted ? (
        <div className="space-y-4">
          <div
            className="rounded-xl bg-card border-2 border-foreground p-6 text-center"
            style={{ boxShadow: "var(--shadow-brutal)" }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {score >= 75 ? (
                <CheckCircle2 className="w-6 h-6" style={{ color: "var(--color-verse-match)" }} />
              ) : (
                <XCircle className="w-6 h-6" style={{ color: "var(--color-context)" }} />
              )}
              <span className="text-2xl font-black text-foreground score-display">
                {score}/100
              </span>
            </div>
            <p className="text-muted-foreground text-xs font-bold">
              {score === 100
                ? "Perfect matching! Your verse recall is strong!"
                : score >= 75
                  ? "Well done! Almost all matches correct."
                  : score >= 50
                    ? "Good effort. Keep studying these verses."
                    : "More training needed — review these passages!"}
            </p>
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
              {isPractice ? "Play Again →" : "Complete Workout →"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(matches).length < drill.pairs.length}
          className={`w-full py-3.5 rounded-xl font-black text-sm transition-all duration-150 border-2 border-foreground uppercase tracking-wide ${
            Object.keys(matches).length < drill.pairs.length
              ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
              : "text-white btn-brutal"
          }`}
          style={{
            backgroundColor: Object.keys(matches).length < drill.pairs.length
              ? undefined
              : "var(--color-verse-match)",
            boxShadow:
              Object.keys(matches).length < drill.pairs.length
                ? "none"
                : "var(--shadow-brutal)",
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
