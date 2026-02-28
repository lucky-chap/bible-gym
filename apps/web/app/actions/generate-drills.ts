"use server";

import { GoogleGenAI } from "@google/genai";
import {
  BiblePassage,
  ContextQuestionItem,
  MemorizationQuestion,
  Workout,
} from "@/lib/types";

export async function generateThemedWorkout(theme: string): Promise<Workout> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert Bible teacher creating a "Spiritual Workout" for a web app called Bible Gym.
The user has requested a workout based on the theme: "${theme}".

Generate 3 distinct Bible passages related to this theme.
For each passage, provide:
1. The passage text (NIV or ESV, 1-3 verses long)
2. The reference (e.g., "John 3:16")
3. The book name, chapter number, and verse range
4. A context challenge question related to the passage, with 4 multiple choice options, and the index (0-3) of the correct answer.

Return the result strictly as a JSON object matching this schema:
{
  "passages": [
    {
      "reference": "string",
      "text": "string",
      "book": "string",
      "chapter": number,
      "verses": "string",
      "contextQuestion": {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctIndex": number
      }
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

  // Map the AI data into our Drill types
  const seed = Date.now();

  const mappedPassages: BiblePassage[] = data.passages.map(
    (p: { reference: string; text: string; book: string; chapter: number; verses: string }) => ({
      reference: p.reference,
      text: p.text,
      book: p.book,
      chapter: p.chapter,
      verses: p.verses,
    })
  );

  const memorizationQuestions: MemorizationQuestion[] = data.passages.map(
    (p: { text: string }, i: number) => {
      const words = p.text.split(" ");
      const numBlanks = Math.max(2, Math.floor(words.length * 0.3));

      const eligibleIndices = words
        .map((w: string, idx: number) => ({ word: w, index: idx }))
        .filter(
          (w: { word: string }) =>
            w.word.replace(/[^a-zA-Z]/g, "").length > 2
        );

      // Shuffle eligible indices
      for (let x = eligibleIndices.length - 1; x > 0; x--) {
        const y = Math.floor(Math.random() * (x + 1));
        [eligibleIndices[x], eligibleIndices[y]] = [
          eligibleIndices[y],
          eligibleIndices[x],
        ];
      }

      const blankedWords = eligibleIndices
        .slice(0, numBlanks)
        .map((w: { index: number; word: string }) => ({
          index: w.index,
          word: w.word,
        }));

      return {
        id: `ai-mem-${seed}-${i}`,
        passage: mappedPassages[i],
        blankedWords: blankedWords.sort(
          (a: { index: number }, b: { index: number }) => a.index - b.index
        ),
      };
    }
  );

  const contextQuestions: ContextQuestionItem[] = data.passages.map(
    (
      p: {
        contextQuestion: {
          question: string;
          options: string[];
          correctIndex: number;
        };
      },
      i: number
    ) => ({
      id: `ai-ctx-${seed}-${i}`,
      question: p.contextQuestion.question,
      options: p.contextQuestion.options,
      correctIndex: p.contextQuestion.correctIndex,
      passage: mappedPassages[i],
    })
  );

  const verseMatchPairs = data.passages.map(
    (p: { reference: string; text: string }) => ({
      reference: p.reference,
      text: p.text,
    })
  );

  return {
    id: `workout-ai-${seed}`,
    date: new Date().toISOString().split("T")[0],
    isGroupChallenge: true,
    theme: theme,
    drills: [
      {
        type: "memorization",
        questions: memorizationQuestions,
      },
      {
        type: "context",
        questions: contextQuestions,
      },
      {
        type: "verse-match",
        pairs: verseMatchPairs,
      },
    ],
    completed: false,
    scores: {
      memorization: 0,
      context: 0,
      verseMatch: 0,
    },
    totalScore: 0,
  };
}

export async function generateRandomAIDrill(): Promise<Workout["drills"][0]> {
  const themes = [
    "Faith and Endurance",
    "Love and Compassion",
    "God's Power and Majesty",
    "Forgiveness and Mercy",
    "Hope and Encouragement",
    "Wisdom and Guidance",
    "Peace and Stillness",
    "Service and Sacrifice",
  ];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  const fullWorkout = await generateThemedWorkout(randomTheme);
  // Pick a random drill from the 3 types
  return fullWorkout.drills[Math.floor(Math.random() * 3)];
}
