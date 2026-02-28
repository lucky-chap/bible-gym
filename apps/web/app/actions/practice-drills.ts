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

function buildBlanks(passage: BiblePassage, seed: number, index: number): MemorizationQuestion {
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
  type: "memorization" | "context" | "verse-match" | "ai-themed" | null,
): Drill {
  const seed = Date.now();
  if (type === "memorization") {
    const passages = shuffleArray(BIBLE_PASSAGES).slice(0, 3);
    return {
      type: "memorization",
      questions: passages.map((p, i) => buildBlanks(p, seed, i)),
    };
  } else if (type === "context") {
    const passages = shuffleArray(BIBLE_PASSAGES).slice(0, 3);
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
  } else {
    return {
      type: "verse-match",
      pairs: shuffleArray(VERSE_MATCH_ITEMS).slice(0, 3),
    };
  }
}

// ━━ AI + Bible API path ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function generatePracticeDrillAction(
  type: "memorization" | "context" | "verse-match",
  config: PracticeConfig,
): Promise<DrillResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // No API key — fall back immediately
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set. Using local fallback.");
    return { drill: localFallback(type), isAiGenerated: false };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let promptRequest: string;
    if (config.by === "book") {
      promptRequest = `3 diverse passage references (1-3 verses each) from the book of ${config.value}`;
    } else if (config.by === "chapter") {
      promptRequest = `3 diverse passage references (1-3 verses each) from ${config.value}`;
    } else if (config.by === "theme") {
      promptRequest = `3 diverse passage references (1-3 verses each) related to the theme: ${config.value}`;
    } else {
      promptRequest = `3 diverse passage references (1-3 verses each) from random books and chapters across the entire Bible`;
    }

    let prompt = `
You are an expert Bible teacher creating a practice drill.
The user requested ${promptRequest}.

Provide exactly 3 Bible passage references.
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
    } else {
      const pairs = passagesWithText.map((p) => ({
        reference: p.reference,
        text: p.text,
      }));
      return { drill: { type: "verse-match", pairs }, isAiGenerated: true };
    }
  } catch (e) {
    console.error("AI drill generation failed, using local fallback:", e);
    return { drill: localFallback(type), isAiGenerated: false };
  }
}
