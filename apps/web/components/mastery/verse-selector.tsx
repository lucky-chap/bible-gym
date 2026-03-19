"use client";

import { useState } from "react";
import { MASTERY_PACKS, MasteryPack } from "@/lib/mastery-data";
import { BiblePassage } from "@/lib/types";
import { useMastery } from "@/lib/store";
import {
  BookOpen,
  Search,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  Trophy,
  Flame,
  ArrowLeft,
} from "lucide-react";

export function VerseSelector() {
  const { verseMastery, masteryStats, startMastery } = useMastery();
  const [selectedPack, setSelectedPack] = useState<MasteryPack | null>(null);
  const [selectedVerses, setSelectedVerses] = useState<BiblePassage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleVerse = (verse: BiblePassage) => {
    if (selectedVerses.find((v) => v.reference === verse.reference)) {
      setSelectedVerses(
        selectedVerses.filter((v) => v.reference !== verse.reference),
      );
    } else {
      if (selectedVerses.length < 5) {
        setSelectedVerses([...selectedVerses, verse]);
      }
    }
  };

  const handleStart = () => {
    if (selectedVerses.length > 0) {
      startMastery(selectedVerses[0]);
    }
  };

  if (selectedPack) {
    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
        <button
          onClick={() => setSelectedPack(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Packs
        </button>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            {selectedPack.name}
          </h2>
          <p className="text-muted-foreground font-medium text-sm">
            {selectedPack.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {selectedPack.verses.map((verse) => {
            const mastery = verseMastery[verse.reference];
            const isSelected = selectedVerses.some(
              (v) => v.reference === verse.reference,
            );
            const isMastered = mastery?.status === "mastered";

            return (
              <button
                key={verse.reference}
                onClick={() => toggleVerse(verse)}
                className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "bg-primary/5 border-primary"
                    : "bg-card border-foreground card-brutal"
                }`}
                style={{
                  boxShadow: isSelected
                    ? "var(--shadow-brutal-pink)"
                    : "var(--shadow-brutal)",
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-base text-foreground verse-ref">
                      {verse.reference}
                    </span>
                    {isMastered && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest" style={{
                        backgroundColor: "rgba(42, 125, 95, 0.1)",
                        color: "var(--color-verse-match)",
                        borderColor: "rgba(42, 125, 95, 0.3)",
                      }}>
                        Mastered
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground line-clamp-2 italic leading-relaxed">
                    &ldquo;{verse.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  {mastery && !isMastered && (
                    <div className="flex flex-col items-center">
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        Level
                      </div>
                      <div className="text-base font-black text-primary score-display">
                        {mastery.currentLevel}/5
                      </div>
                    </div>
                  )}
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-foreground"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedVerses.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 animate-slide-up">
            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-sm border-2 border-foreground flex items-center justify-center gap-2.5 uppercase tracking-wide"
              style={{ boxShadow: "0px 6px 0px 0px var(--foreground)" }}
            >
              <PlayCircle className="w-5 h-5" />
              Start Training ({selectedVerses.length}{" "}
              {selectedVerses.length === 1 ? "Verse" : "Verses"})
            </button>
          </div>
        )}
      </div>
    );
  }

  const packColors: Record<string, { bg: string; hover: string; accent: string }> = {
    salvation: { bg: "bg-[#FFF0F1]", hover: "hover:bg-[#FFE4E6]", accent: "bg-primary" },
    faith: { bg: "bg-[#EDF4FC]", hover: "hover:bg-[#DCE8F8]", accent: "bg-[var(--color-memorization)]" },
    identity: { bg: "bg-[#F3F0FF]", hover: "hover:bg-[#EDE9FE]", accent: "bg-[var(--color-mastery)]" },
    wisdom: { bg: "bg-[#FFF8EB]", hover: "hover:bg-[#FEF0D5]", accent: "bg-[var(--color-context)]" },
    discipline: { bg: "bg-[#EDFCF2]", hover: "hover:bg-[#D6F5E5]", accent: "bg-[var(--color-verse-match)]" },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Verse Mastery</h2>
          <p className="text-muted-foreground font-bold text-xs">
            Scientific training for Scripture memorization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border-2" style={{ backgroundColor: "rgba(107, 79, 160, 0.05)", borderColor: "rgba(107, 79, 160, 0.3)" }}>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--color-mastery)" }}>
              Consistency
            </span>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 animate-fire" style={{ color: "var(--color-mastery)", fill: "var(--color-mastery)" }} />
              <span className="text-base font-black text-foreground score-display">
                {masteryStats.streak}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border-2" style={{ backgroundColor: "rgba(196, 127, 42, 0.05)", borderColor: "rgba(196, 127, 42, 0.3)" }}>
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--color-context)" }}>
              Mastered
            </span>
            <div className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" style={{ color: "var(--color-context)" }} />
              <span className="text-base font-black text-foreground score-display">
                {masteryStats.totalMastered}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for a verse or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-5 py-3.5 rounded-xl bg-card border-2 border-foreground text-foreground font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          style={{ boxShadow: "var(--shadow-brutal)" }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MASTERY_PACKS.map((pack) => {
          const color = packColors[pack.id] || packColors.salvation;

          return (
            <button
              key={pack.id}
              onClick={() => setSelectedPack(pack)}
              className={`group relative overflow-hidden rounded-xl border-2 border-foreground p-6 text-left ${color.bg} ${color.hover} card-brutal`}
              style={{ boxShadow: "var(--shadow-brutal-lg)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl ${color.accent} border-2 border-foreground flex items-center justify-center`}
                  style={{ boxShadow: "var(--shadow-brutal-press)" }}
                >
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base font-black text-foreground mb-1.5 tracking-tight">
                {pack.name}
              </h3>
              <p className="text-xs font-medium text-muted-foreground mb-3 leading-relaxed">
                {pack.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-foreground/70 tracking-wider">
                  {pack.verses.length} Verses
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                  {
                    pack.verses.filter(
                      (v) => verseMastery[v.reference]?.status === "mastered",
                    ).length
                  }{" "}
                  Mastered
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
