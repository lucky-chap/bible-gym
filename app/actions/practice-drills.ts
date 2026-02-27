"use server";

import { GoogleGenAI } from "@google/genai";
import { PracticeConfig, Drill, BiblePassage, MemorizationQuestion, ContextQuestionItem } from "@/lib/types";
import { fetchBibleVerse } from "@/lib/bible-api";

export async function generatePracticeDrillAction(
  type: "memorization" | "context" | "verse-match",
  config: PracticeConfig
): Promise<Drill> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let promptRequest = "";
  if (config.by === "book") {
    promptRequest = `3 diverse passage references (1-3 verses each) from the book of ${config.value}`;
  } else if (config.by === "chapter") {
    promptRequest = `3 diverse passage references (1-3 verses each) from ${config.value}`;
  } else {
    promptRequest = `3 diverse passage references (1-3 verses each) related to the theme: ${config.value}`;
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
    config: {
      responseMimeType: "application/json",
    },
  });

  const responseText = response.text ?? "";
  const data = JSON.parse(responseText);
  
  // Fetch texts from bible-api.com
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
    } catch (e) {
      console.error(`Failed to fetch ${p.reference}, skipping`, e);
      // Fallback empty text so we can at least render something or filter
      passagesWithText.push({
        reference: p.reference,
        text: "(Text could not be loaded from API)",
        book: p.book,
        chapter: p.chapter,
        verses: p.verses,
      });
    }
  }

  const seed = Date.now();

  if (type === "memorization") {
    const questions: MemorizationQuestion[] = passagesWithText.map((p, i) => {
      const words = p.text.split(" ");
      const numBlanks = Math.max(2, Math.floor(words.length * 0.3));

      const eligibleIndices = words
        .map((w, idx) => ({ word: w, index: idx }))
        .filter((w) => w.word.replace(/[^a-zA-Z]/g, "").length > 2);

      // Shuffle eligible indices
      for (let x = eligibleIndices.length - 1; x > 0; x--) {
        const y = Math.floor(Math.random() * (x + 1));
        [eligibleIndices[x], eligibleIndices[y]] = [eligibleIndices[y], eligibleIndices[x]];
      }

      const blankedWords = eligibleIndices
        .slice(0, numBlanks)
        .map((w) => ({
          index: w.index,
          word: w.word,
        }));

      return {
        id: `practice-mem-${seed}-${i}`,
        passage: p,
        blankedWords: blankedWords.sort((a, b) => a.index - b.index),
      };
    });

    return { type: "memorization", questions };
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
    return { type: "context", questions };
  } else {
    // verse-match
    const pairs = passagesWithText.map((p) => ({
      reference: p.reference,
      text: p.text,
    }));
    return { type: "verse-match", pairs };
  }
}
