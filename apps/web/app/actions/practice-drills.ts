"use server";

import { GoogleGenAI } from "@google/genai";
import {
  PracticeConfig,
  Drill,
  BiblePassage,
  MemorizationQuestion,
  ContextQuestionItem,
} from "@/lib/types";
import { fetchBibleVerse } from "@/lib/bible-api";
import {
  BIBLE_PASSAGES,
  CONTEXT_QUESTIONS,
  VERSE_MATCH_ITEMS,
} from "@/lib/bible-data";
import { BIBLE_BOOKS } from "@/lib/bible-structure";

export interface DrillResult {
  drill: Drill;
  isAiGenerated: boolean;
}

// ━━ Fallback helpers (pure local data, no network) ━━━━━━━━━━━━━━━━━━━━━━━━━━

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildBlanks(
  passage: BiblePassage,
  seed: number,
  index: number,
): MemorizationQuestion {
  const words = passage.text.split(" ");
  const numBlanks = Math.max(2, Math.floor(words.length * 0.3));
  const eligible = shuffleArray(
    words
      .map((w, i) => ({ word: w, index: i }))
      .filter(({ word }) => word.replace(/[^a-zA-Z]/g, "").length > 2),
  );
  return {
    id: `fallback-mem-${seed}-${index}`,
    passage,
    blankedWords: eligible
      .slice(0, numBlanks)
      .map(({ index: idx, word }) => ({ index: idx, word }))
      .sort((a, b) => a.index - b.index),
  };
}

function localFallback(
  type:
    | "memorization"
    | "context"
    | "verse-match"
    | "rearrange"
    | "ai-themed"
    | null,
): Drill {
  const seed = Date.now();
  const count = Math.floor(Math.random() * 3) + 4; // 4 to 6

  if (type === "memorization") {
    const passages = shuffleArray(BIBLE_PASSAGES).slice(0, count);
    return {
      type: "memorization",
      questions: passages.map((p, i) => buildBlanks(p, seed, i)),
    };
  } else if (type === "context") {
    const passages = shuffleArray(BIBLE_PASSAGES).slice(0, count);
    return {
      type: "context",
      questions: passages.map((p, i) => {
        const q =
          CONTEXT_QUESTIONS.find((c) => c.passageReference === p.reference) ||
          CONTEXT_QUESTIONS[i % CONTEXT_QUESTIONS.length];
        return {
          id: `fallback-ctx-${seed}-${i}`,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          passage: p,
        };
      }),
    };
  } else if (type === "rearrange") {
    // Only pick passages that are long (at least ~200 chars or known multi-verse)
    const longPassages = BIBLE_PASSAGES.filter(
      (p) => p.verses.includes("-") || p.text.length > 200,
    );
    const p =
      longPassages.length > 0
        ? longPassages[Math.floor(Math.random() * longPassages.length)]
        : BIBLE_PASSAGES[5]; // Ps 23

    // Split by sentences to get units that feel like verses if verseTexts is missing
    const units = p.text
      .split(/(?<=[.!?])\s+/)
      .filter((u) => u.trim().length > 0)
      .map((text, i) => ({
        id: `fallback-rearrange-unit-${seed}-${i}`,
        text: text.trim(),
        originalIndex: i,
      }));

    // If we still have < 4 units, we slice the text into arbitrary parts to ensure the drill works
    if (units.length < 4) {
      const words = p.text.split(" ");
      const chunkSize = Math.ceil(words.length / 4);
      const forcedUnits = [];
      for (let i = 0; i < 4; i++) {
        forcedUnits.push({
          id: `fallback-rearrange-forced-${seed}-${i}`,
          text: words.slice(i * chunkSize, (i + 1) * chunkSize).join(" "),
          originalIndex: i,
        });
      }
      return {
        type: "rearrange",
        passage: p,
        shuffledVerses: shuffleArray(forcedUnits),
      };
    }

    return {
      type: "rearrange",
      passage: p,
      shuffledVerses: shuffleArray(units.slice(0, 6)), // Limit to max 6
    };
  } else {
    return {
      type: "verse-match",
      pairs: shuffleArray(VERSE_MATCH_ITEMS).slice(0, count),
    };
  }
}

// ━━ Bible API ONLY path (No AI) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function fetchPassagesFromBibleApi(
  config: PracticeConfig,
  count: number,
): Promise<BiblePassage[]> {
  const passages: BiblePassage[] = [];
  try {
    let queryRef = config.value;

    // If "By Book", pick a random chapter from that book
    if (config.by === "book" && !/\d/.test(queryRef)) {
      const bookData = BIBLE_BOOKS.find(
        (b) => b.name.toLowerCase() === queryRef.toLowerCase(),
      );
      if (bookData) {
        const randomChapter = Math.floor(Math.random() * bookData.chapters) + 1;
        queryRef = `${bookData.name} ${randomChapter}`;
      } else {
        queryRef += " 1";
      }
    }

    // If random or no value
    if (config.by === "random" || !queryRef.trim()) {
      const bookData =
        BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
      const randomChapter = Math.floor(Math.random() * bookData.chapters) + 1;
      queryRef = `${bookData.name} ${randomChapter}`;
    }

    // If rearranging (count === 1) and no specific verses selected, fetch the whole chapter
    // to allow random 4-6 verse selection later.
    if (count === 1 && !config.verses) {
      if (queryRef.includes(":")) {
        queryRef = queryRef.split(":")[0];
      }

      // Bonus: If it's the "random" or "book" path and we picked a chapter,
      // check if it's long enough. If not, pick a known long chapter.
      const parts = queryRef.split(" ");
      const bookName = parts.slice(0, -1).join(" ");
      const chapterNum = parseInt(parts[parts.length - 1]);
      const bookData = BIBLE_BOOKS.find(
        (b) => b.name.toLowerCase() === bookName.toLowerCase(),
      );
      if (
        bookData &&
        bookData.verses[chapterNum - 1] &&
        bookData.verses[chapterNum - 1].length < 4
      ) {
        // Find a random chapter in this book that has >= 4 verses
        const longChapters = bookData.verses
          .map((v, i) => ({ index: i + 1, length: v.length }))
          .filter((c) => c.length >= 4);
        if (longChapters.length > 0) {
          const chosen =
            longChapters[Math.floor(Math.random() * longChapters.length)];
          queryRef = `${bookData.name} ${chosen.index}`;
        }
      }
    } else {
      // For non-rearrange or if specific verses are requested
      if (config.verses) {
        // Only append if it's not already in queryRef
        if (!queryRef.includes(":")) {
          queryRef += `:${config.verses}`;
        }
      }
    }

    // Fetch the chapter or passage
    const url = `https://bible-api.com/${encodeURIComponent(queryRef)}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.log(
        "Bible API fetch failed for",
        queryRef,
        "- falling back to local data",
      );
      return shuffleArray(BIBLE_PASSAGES).slice(0, count);
    }

    const data = await res.json();

    if (data.verses && data.verses.length > 0) {
      // If rearranging and we still somehow got < 4 verses, return local fallback to avoid breaking the drill UI
      if (count === 1 && data.verses.length < 4) {
        return [BIBLE_PASSAGES[5]]; // Psalm 23 is a safe fallback
      }

      // If a range was requested (e.g. 16-18) OR we only want 1 passage (rearrange),
      // return the whole thing as one passage, but limit rearrange to 4-6 verses if it's too long.
      if (config.verses?.includes("-") || count === 1) {
        let selectedVerses = data.verses;
        let finalReference = data.reference;

        if (count === 1 && selectedVerses.length > 6) {
          const chunkLength = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6
          const maxStartIndex = selectedVerses.length - chunkLength;
          const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));
          selectedVerses = selectedVerses.slice(
            startIndex,
            startIndex + chunkLength,
          );

          finalReference = `${selectedVerses[0].book_name} ${selectedVerses[0].chapter}:${selectedVerses[0].verse}-${selectedVerses[selectedVerses.length - 1].verse}`;
        }

        return [
          {
            reference: finalReference,
            text: selectedVerses
              .map((v: any) => (v.text || "").trim())
              .join(" "),
            book: selectedVerses[0].book_name,
            chapter: selectedVerses[0].chapter,
            verses:
              config.verses && selectedVerses.length === data.verses.length
                ? config.verses
                : `${selectedVerses[0].verse}-${selectedVerses[selectedVerses.length - 1].verse}`,
            verseTexts: selectedVerses.map((v: any) => (v.text || "").trim()),
          },
        ];
      }

      // Otherwise (e.g. memorization/verse-match with 3 verses), pick 'count' random verses
      const randomVerses = shuffleArray(data.verses).slice(
        0,
        Math.min(count, data.verses.length),
      );

      for (const v of randomVerses) {
        const verseData = v as any;
        passages.push({
          reference: `${verseData.book_name} ${verseData.chapter}:${verseData.verse}`,
          text: (verseData.text || "").trim(),
          book: verseData.book_name,
          chapter: verseData.chapter,
          verses: `${verseData.verse}`,
        });
      }
      return passages;
    }
  } catch (error) {
    console.error("Bible API fetch error:", error);
  }

  // Final fallback
  return shuffleArray(BIBLE_PASSAGES).slice(0, count);
}

export async function generatePracticeDrillAction(
  type: "memorization" | "context" | "verse-match" | "rearrange",
  config: PracticeConfig,
): Promise<DrillResult> {
  let count = 3;
  if (type === "rearrange") {
    count = 1;
  } else if (type === "verse-match") {
    count = Math.floor(Math.random() * 3) + 4; // 4 to 6
  } else {
    count = Math.floor(Math.random() * 3) + 4; // Updating others to 4-6 as well for variety, matching user expectations since they mentioned 4 to 6
  }

  const passagesWithText = await fetchPassagesFromBibleApi(config, count);
  const seed = Date.now();

  try {
    if (type === "memorization") {
      const questions: MemorizationQuestion[] = passagesWithText.map((p, i) =>
        buildBlanks(p, seed, i),
      );
      return {
        drill: { type: "memorization", questions },
        isAiGenerated: false,
      };
    } else if (type === "verse-match") {
      const pairs = passagesWithText.map((p) => ({
        reference: p.reference,
        text: p.text,
      }));
      return { drill: { type: "verse-match", pairs }, isAiGenerated: false };
    } else if (type === "rearrange") {
      const p = passagesWithText[0];
      const items =
        p.verseTexts && p.verseTexts.length > 1
          ? p.verseTexts
          : p.text
              .split(/\n\n+|(?<=[.;?])\s+/)
              .filter((u) => u.trim().length > 0);

      const units = items.slice(0, 6).map((text, i) => ({
        id: `rearrange-unit-${seed}-${i}`,
        text: text.trim(),
        originalIndex: i,
      }));
      return {
        drill: {
          type: "rearrange",
          passage: p,
          shuffledVerses: shuffleArray(units),
        },
        isAiGenerated: false,
      };
    } else if (type === "context") {
      const allBooks = BIBLE_BOOKS.map((b) => b.name);
      const questions: ContextQuestionItem[] = passagesWithText.map((p, i) => {
        const optionSet = new Set<string>();
        optionSet.add(p.book);
        while (optionSet.size < 4) {
          const randomBook =
            allBooks[Math.floor(Math.random() * allBooks.length)];
          if (randomBook) optionSet.add(randomBook);
        }
        const options = shuffleArray(Array.from(optionSet));
        const correctIndex = options.indexOf(p.book);

        return {
          id: `context-api-${seed}-${i}`,
          question: "Which book of the Bible does this passage belong to?",
          options,
          correctIndex,
          passage: p,
        };
      });

      return { drill: { type: "context", questions }, isAiGenerated: false };
    } else {
      return { drill: localFallback(type), isAiGenerated: false };
    }
  } catch (e) {
    console.error("Drill generation failed, using local fallback:", e);
    return { drill: localFallback(type), isAiGenerated: false };
  }

  /* // -------- AI LOGIC COMMENTED OUT FOR NOW ---------
  const apiKey = process.env.GEMINI_API_KEY;

  // No API key — fall back immediately
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set. Using local fallback.");
    return { drill: localFallback(type), isAiGenerated: false };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let promptRequest: string;
    const count = type === "rearrange" ? 1 : 3;
    const length = type === "rearrange" ? "single longer passage (4-6 verses)" : "3 diverse passage references (1-3 verses each)";

    if (config.by === "book") {
      promptRequest = `${length} from the book of ${config.value}`;
    } else if (config.by === "chapter") {
      promptRequest = `${length} from ${config.value}`;
    } else if (config.by === "theme") {
      promptRequest = `${length} related to the theme: ${config.value}`;
    } else {
      promptRequest = `${length} from random books and chapters across the entire Bible`;
    }

    let prompt = `
You are an expert Bible teacher creating a practice drill.
The user requested ${promptRequest}.

Provide exactly ${count} Bible passage reference(s).
Format the output STRICTLY as a JSON object matching this schema:
{
  "passages": [
    {
      "reference": "string (e.g., 'John 3:16')",
      "book": "string",
      "chapter": number,
      "verses": "string"`;

    if (type === "context") {
      prompt += `,
      "contextQuestion": {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctIndex": number (0-3)
      }
`;
    }

    prompt += `
    }
  ]
}
Do NOT include any markdown formatting or code fences. Return ONLY the raw JSON object.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text ?? "");

    // Fetch actual verse text from Bible API
    const passagesWithText: BiblePassage[] = [];
    for (const p of data.passages) {
      try {
        const fetched = await fetchBibleVerse(p.reference);
        passagesWithText.push({
          reference: fetched.reference,
          text: fetched.text,
          book: fetched.book || p.book,
          chapter: fetched.chapter || p.chapter,
          verses: fetched.verses || p.verses,
        });
      } catch {
        passagesWithText.push({
          reference: p.reference,
          text: "(Text could not be loaded)",
          book: p.book,
          chapter: p.chapter,
          verses: p.verses,
        });
      }
    }

    const seed = Date.now();

    if (type === "memorization") {
      const questions: MemorizationQuestion[] = passagesWithText.map((p, i) =>
        buildBlanks(p, seed, i),
      );
      return { drill: { type: "memorization", questions }, isAiGenerated: true };
    } else if (type === "context") {
      const questions: ContextQuestionItem[] = passagesWithText.map((p, i) => {
        const aiPassage = data.passages[i];
        return {
          id: `practice-ctx-${seed}-${i}`,
          question: aiPassage.contextQuestion.question,
          options: aiPassage.contextQuestion.options,
          correctIndex: aiPassage.contextQuestion.correctIndex,
          passage: p,
        };
      });
      return { drill: { type: "context", questions }, isAiGenerated: true };
    } else if (type === "verse-match") {
      const pairs = passagesWithText.map((p) => ({
        reference: p.reference,
        text: p.text,
      }));
      return { drill: { type: "verse-match", pairs }, isAiGenerated: true };
    } else if (type === "rearrange") {
      const p = passagesWithText[0];
      const units = p.text.split(/(?<=[.;?])\s+/).filter(u => u.length > 0).map((text, i) => ({
        id: `rearrange-unit-${seed}-${i}`,
        text: text.trim(),
        originalIndex: i
      }));
      return {
        drill: {
          type: "rearrange",
          passage: p,
          shuffledVerses: shuffleArray(units)
        },
        isAiGenerated: true
      };
    } else {
      return { drill: { type: "verse-match", pairs: [] }, isAiGenerated: false };
    }
  } catch (e) {
    console.error("AI drill generation failed, using local fallback:", e);
    return { drill: localFallback(type), isAiGenerated: false };
  }
  */
}
