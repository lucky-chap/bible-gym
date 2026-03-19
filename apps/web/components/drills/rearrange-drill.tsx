"use client";

import { useState } from "react";
import { RearrangeDrill } from "@/lib/types";
import { GripVertical, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface SortableItemProps {
  item: any;
  isSubmitted?: boolean;
  isCorrect?: boolean;
}

function SortableItem({ item, isSubmitted, isCorrect }: SortableItemProps) {
  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={!isSubmitted}
      className={`relative group flex items-start gap-3 p-4 border-2 rounded-xl bg-card ${
        isSubmitted
          ? isCorrect
            ? "border-foreground bg-[#D6F5E5]"
            : "border-destructive bg-red-50"
          : "border-foreground"
      } ${!isSubmitted ? "cursor-grab active:cursor-grabbing hover:bg-muted/30" : ""}`}
      style={{
        boxShadow: !isSubmitted ? "var(--shadow-brutal-press)" : "none",
      }}
      whileDrag={{
        scale: 1.02,
        boxShadow: "8px 8px 0px 0px var(--foreground)",
        rotate: 1,
        zIndex: 10,
        backgroundColor: "var(--card)",
      }}
    >
      <div
        className={`mt-0.5 p-1 rounded-md shrink-0 transition-colors ${
          isSubmitted
            ? "opacity-0"
            : "text-muted-foreground group-hover:text-primary"
        }`}
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <p className="font-bold text-foreground leading-relaxed select-none text-sm">
        {item.text}
      </p>
    </Reorder.Item>
  );
}

interface RearrangeDrillProps {
  drill: RearrangeDrill;
  onComplete: (score: number, order: any[]) => void;
  onShowResults?: () => void;
  isAiGenerated?: boolean;
  isPractice?: boolean;
  onExit?: () => void;
}

export function RearrangeDrillComponent({
  drill,
  onComplete,
  onShowResults,
  isAiGenerated,
  isPractice,
  onExit,
}: RearrangeDrillProps) {
  const [items, setItems] = useState(drill.shuffledVerses);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correct = 0;
    items.forEach((item, index) => {
      if (item.originalIndex === index) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / items.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);
    onShowResults?.();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Rearrange</h2>
            {isAiGenerated && (
              <span className="flex items-center gap-1 px-2 py-0.5 mt-1 text-[9px] font-black uppercase rounded-md bg-purple-100 text-purple-700 border border-purple-200 tracking-widest">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            )}
          </div>
          <div
            className="px-3 py-1.5 rounded-md bg-primary/10 border-2 border-primary text-primary font-black text-[10px] uppercase tracking-widest verse-ref"
            style={{ boxShadow: "var(--shadow-brutal-press)" }}
          >
            {drill.passage.reference}
          </div>
        </div>
        <p className="text-muted-foreground font-medium text-sm">
          Drag the verses into their correct chronological order.
        </p>
      </div>

      <div className="space-y-3">
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={setItems}
          className="flex flex-col gap-3"
        >
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              item={item}
              isSubmitted={isSubmitted}
              isCorrect={item.originalIndex === index}
            />
          ))}
        </Reorder.Group>
      </div>

      <div className="flex justify-center pt-6">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 w-full text-center"
            >
              <div
                className="rounded-xl bg-card border-2 border-foreground p-6"
                style={{ boxShadow: "var(--shadow-brutal)" }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl font-black text-foreground score-display">
                    {score}/100
                  </span>
                </div>
                <p className="text-muted-foreground text-xs font-bold">
                  {score === 100
                    ? "Perfect sequence! Your context recall is impeccable."
                    : score >= 50
                      ? "Good effort. Review this passage again!"
                      : "You might want to practice this one again."}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                {isPractice && onExit && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onExit}
                    className="w-full py-3.5 rounded-xl bg-card text-foreground font-black text-sm border-2 border-foreground btn-brutal"
                  >
                    Go Back
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onComplete(score, items)}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-sm border-2 border-foreground btn-brutal uppercase tracking-wide"
                >
                  {isPractice ? "Play Again →" : "Complete Drill →"}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="submit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
              whileTap={{ y: 0 }}
              onClick={handleSubmit}
              className="group relative px-10 py-3.5 bg-primary text-primary-foreground font-black text-base rounded-xl border-2 border-foreground uppercase tracking-wide"
              style={{ boxShadow: "0px 6px 0px 0px var(--foreground)" }}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5" />
                Check Sequence
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
