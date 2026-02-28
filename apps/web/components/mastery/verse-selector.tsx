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
      // For MVP, if multiple selected, we'll just start with the first one
      // or we could update startMastery to handle a session.
      // Let's start with the first one for now as a simple path.
      startMastery(selectedVerses[0]);
    }
  };

  if (selectedPack) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button
          onClick={() => setSelectedPack(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Packs
        </button>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-foreground">
            {selectedPack.name}
          </h2>
          <p className="text-muted-foreground font-medium">
            {selectedPack.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
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
                className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? "bg-primary/5 border-primary"
                    : "bg-card border-foreground hover:translate-x-1"
                }`}
                style={{
                  boxShadow: isSelected
                    ? "4px 4px 0px 0px var(--primary)"
                    : "4px 4px 0px 0px var(--foreground)",
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-lg text-foreground">
                      {verse.reference}
                    </span>
                    {isMastered && (
                      <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-black border border-[#10B981]/30 uppercase">
                        Mastered
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground line-clamp-2 italic">
                    &ldquo;{verse.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  {mastery && !isMastered && (
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] font-black text-muted-foreground uppercase">
                        Level
                      </div>
                      <div className="text-lg font-black text-primary">
                        {mastery.currentLevel}/5
                      </div>
                    </div>
                  )}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "bg-primary border-primary text-white"
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
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 animate-in slide-in-from-bottom-8">
            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-lg border-2 border-foreground hover:translate-y-[-4px] active:translate-y-0 transition-all flex items-center justify-center gap-3"
              style={{ boxShadow: "0px 8px 0px 0px var(--foreground)" }}
            >
              <PlayCircle className="w-6 h-6" />
              Start Training ({selectedVerses.length}{" "}
              {selectedVerses.length === 1 ? "Verse" : "Verses"})
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-foreground">Verse Mastery</h2>
          <p className="text-muted-foreground font-bold">
            Scientific training for Scripture memorization.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center px-4 py-2 bg-[#8B5CF6]/5 border-2 border-[#8B5CF6]/30 rounded-xl">
            <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-wider">
              Consistency
            </span>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-[#8B5CF6] fill-[#8B5CF6]" />
              <span className="text-xl font-black text-foreground">
                {masteryStats.streak}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center px-4 py-2 bg-[#F59E0B]/5 border-2 border-[#F59E0B]/30 rounded-xl">
            <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-wider">
              Mastered
            </span>
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xl font-black text-foreground">
                {masteryStats.totalMastered}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for a verse or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-card border-2 border-foreground text-foreground font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
          style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MASTERY_PACKS.map((pack) => {
          const colors: Record<
            string,
            { bg: string; hover: string; accent: string }
          > = {
            salvation: {
              bg: "bg-[#FFF1F2]",
              hover: "hover:bg-[#FFE4E6]",
              accent: "bg-primary",
            },
            faith: {
              bg: "bg-[#EFF6FF]",
              hover: "hover:bg-[#DBEAFE]",
              accent: "bg-[#3B82F6]",
            },
            identity: {
              bg: "bg-[#F5F3FF]",
              hover: "hover:bg-[#EDE9FE]",
              accent: "bg-[#8B5CF6]",
            },
            wisdom: {
              bg: "bg-[#FFFBEB]",
              hover: "hover:bg-[#FEF3C7]",
              accent: "bg-[#F59E0B]",
            },
            discipline: {
              bg: "bg-[#F0FDF4]",
              hover: "hover:bg-[#DCFCE7]",
              accent: "bg-[#10B981]",
            },
          };
          const color = colors[pack.id] || colors.salvation;

          return (
            <button
              key={pack.id}
              onClick={() => setSelectedPack(pack)}
              className={`group relative overflow-hidden rounded-3xl border-2 border-foreground p-8 text-left ${color.bg} ${color.hover} hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all`}
              style={{ boxShadow: "6px 6px 0px 0px var(--foreground)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${color.accent} border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                >
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">
                {pack.name}
              </h3>
              <p className="text-sm font-medium text-muted-foreground mb-4">
                {pack.description}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase text-foreground/70`}
                >
                  {pack.verses.length} Verses
                </span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                <span className="text-xs font-black text-muted-foreground uppercase">
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
