"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { usePractice } from "@/lib/store";
import { BIBLE_BOOKS } from "@/lib/bible-structure";
import {
  ArrowLeft,
  Book,
  Hash,
  Sparkles,
  PlayCircle,
  Search,
  Dumbbell,
  Target,
  Zap,
  GripVertical,
} from "lucide-react";

export default function PracticeConfigPage() {
  const params = useParams();
  const router = useRouter();
  const { startPractice } = usePractice();
  const type = params.type as
    | "memorization"
    | "context"
    | "verse-match"
    | "rearrange";

  const [selectionType, setSelectionType] = useState<
    "random" | "book" | "chapter" | "theme"
  >("random");
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [theme, setTheme] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [method, setMethod] = useState<"blanks" | "first-letter">("blanks");

  const drillInfo = {
    memorization: {
      name: "Memorization",
      desc: "Fill in missing words from the verse",
      icon: Dumbbell,
      color: "#3B82F6",
    },
    context: {
      name: "Context Challenge",
      desc: "Test your knowledge of the context around the verse",
      icon: Target,
      color: "#F59E0B",
    },
    "verse-match": {
      name: "Verse Match",
      desc: "Match the correct reference to the given verse text",
      icon: Zap,
      color: "#10B981",
    },
    rearrange: {
      name: "Rearrange",
      desc: "Drag verses into the correct sequence",
      icon: GripVertical,
      color: "#EC4899",
    },
  }[type] || {
    name: "Practice",
    desc: "Infinite training mode",
    icon: Sparkles,
    color: "#8B5CF6",
  };

  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter((book) =>
      book.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const handleStart = () => {
    let config;
    if (selectionType === "book" && selectedBook) {
      config = { by: "book" as const, value: selectedBook, method };
    } else if (selectionType === "chapter" && selectedBook && selectedChapter) {
      config = {
        by: "chapter" as const,
        value: `${selectedBook} ${selectedChapter}`,
        method,
      };
    } else if (selectionType === "theme" && theme.trim()) {
      config = { by: "theme" as const, value: theme.trim(), method };
    } else {
      config = { by: "random" as const, value: "random", method };
    }

    startPractice(type, config);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-black text-xl text-foreground">
              {drillInfo.name}
            </h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              Configure Practice
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 space-y-8 w-full">
        {/* Drill Preview */}
        <div
          className="flex items-center gap-4 p-6 rounded-2xl bg-card border-2 border-foreground"
          style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl border-2 border-foreground flex items-center justify-center shrink-0"
            style={{
              backgroundColor: drillInfo.color,
              boxShadow: "3px 3px 0px 0px var(--foreground)",
            }}
          >
            <drillInfo.icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {drillInfo.name}
            </h2>
            <p className="text-muted-foreground font-medium">
              {drillInfo.desc}
            </p>
          </div>
        </div>

        {/* Selection Tabs */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">
            Select Mode
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: "random", label: "Random", icon: Sparkles },
              { id: "book", label: "By Book", icon: Book },
              { id: "chapter", label: "By Chapter", icon: Hash },
              { id: "theme", label: "By Theme", icon: Search },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setSelectionType(
                    tab.id as "random" | "book" | "chapter" | "theme",
                  )
                }
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectionType === tab.id
                    ? "bg-primary border-foreground text-white translate-y-[-2px]"
                    : "bg-card border-foreground/10 text-muted-foreground hover:border-foreground/30"
                }`}
                style={
                  selectionType === tab.id
                    ? { boxShadow: "3px 3px 0px 0px var(--foreground)" }
                    : {}
                }
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs font-bold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {selectionType === "theme" && (
          <div className="space-y-4">
            <label className="text-sm font-bold text-foreground">
              What theme would you like to practice?
            </label>
            <div className="relative">
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Love, Forgiveness, Hope..."
                className="w-full px-6 py-4 rounded-2xl bg-card border-2 border-foreground text-foreground font-bold placeholder-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              AI will generate custom drills based on your chosen theme.
            </p>
          </div>
        )}

        {/* Mnemonic Settings (Memorization only) */}
        {type === "memorization" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">
              Memorization Method
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setMethod("blanks")}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  method === "blanks"
                    ? "bg-white border-foreground text-foreground translate-y-[-2px]"
                    : "bg-background border-foreground/10 text-muted-foreground"
                }`}
                style={
                  method === "blanks"
                    ? { boxShadow: "3px 3px 0px 0px var(--foreground)" }
                    : {}
                }
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 border-foreground flex items-center justify-center ${method === "blanks" ? "bg-primary" : "bg-transparent"}`}
                >
                  {method === "blanks" && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-bold">Standard Blanks</span>
              </button>
              <button
                onClick={() => setMethod("first-letter")}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  method === "first-letter"
                    ? "bg-white border-foreground text-foreground translate-y-[-2px]"
                    : "bg-background border-foreground/10 text-muted-foreground"
                }`}
                style={
                  method === "first-letter"
                    ? { boxShadow: "3px 3px 0px 0px var(--foreground)" }
                    : {}
                }
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 border-foreground flex items-center justify-center ${method === "first-letter" ? "bg-primary" : "bg-transparent"}`}
                >
                  {method === "first-letter" && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <span className="font-bold">First Letter Method</span>
              </button>
            </div>
            {/* Method Example */}
            <div
              className="mt-4 p-4 rounded-xl bg-card border-2 border-foreground"
              style={{ boxShadow: "3px 3px 0px 0px var(--foreground)" }}
            >
              <h4 className="text-xs font-black text-primary mb-2 uppercase tracking-wider">
                Example
              </h4>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                {method === "blanks"
                  ? "In the beginning, God created the _______ and the earth."
                  : "I_ t_ b_, G_ c_ t_ h_ a_ t_ e_."}
              </p>
            </div>
          </div>
        )}

        {/* Selection Content */}
        <div className="space-y-4 min-h-[300px]">
          {selectionType === "random" && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed border-foreground/10">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Infinite Mix</h4>
                <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                  A balanced mix of verses from across the entire Bible.
                </p>
              </div>
            </div>
          )}

          {(selectionType === "book" || selectionType === "chapter") && (
            <div className="space-y-6">
              {!selectedBook ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search books..."
                      className="w-full pl-12 pr-6 py-3 rounded-xl bg-card border-2 border-foreground text-foreground font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredBooks.map((book) => (
                      <button
                        key={book.name}
                        onClick={() => setSelectedBook(book.name)}
                        className="p-3 text-left rounded-lg bg-card border-2 border-foreground/10 hover:border-primary hover:bg-primary/5 transition-all group"
                      >
                        <span className="text-sm font-bold group-hover:text-primary transition-colors">
                          {book.name}
                        </span>
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {book.chapters} chapters
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Book className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-bold text-lg">{selectedBook}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBook(null);
                        setSelectedChapter(null);
                      }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Change Book
                    </button>
                  </div>

                  {selectionType === "chapter" ? (
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-foreground">
                        Select a Chapter
                      </label>
                      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                        {Array.from({
                          length:
                            BIBLE_BOOKS.find((b) => b.name === selectedBook)
                              ?.chapters || 0,
                        }).map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setSelectedChapter(i + 1)}
                            className={`aspect-square flex items-center justify-center rounded-lg border-2 font-bold transition-all ${
                              selectedChapter === i + 1
                                ? "bg-primary border-foreground text-white"
                                : "bg-card border-foreground/10 text-foreground hover:border-foreground/30"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed border-foreground/10">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Book className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">
                          All of {selectedBook}
                        </h4>
                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                          Verses will be randomly selected from any chapter in{" "}
                          {selectedBook}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Action Footer */}
      <footer className="sticky bottom-0 z-50 bg-background border-t-2 border-foreground p-6 mt-auto">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleStart}
            disabled={
              (selectionType === "theme" && !theme.trim()) ||
              (selectionType === "book" && !selectedBook) ||
              (selectionType === "chapter" &&
                (!selectedBook || !selectedChapter))
            }
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary disabled:bg-muted disabled:text-muted-foreground disabled:border-muted-foreground/20 text-white font-black text-xl border-2 border-foreground transition-all hover:translate-y-[-2px] active:translate-y-0"
            style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
          >
            <PlayCircle className="w-6 h-6" />
            START PRACTICE
          </button>
        </div>
      </footer>
    </div>
  );
}
