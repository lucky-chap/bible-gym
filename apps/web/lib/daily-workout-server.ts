import { GoogleGenAI } from "@google/genai";
import { Client, Databases, Query, ID } from "node-appwrite";
import {
  Workout,
  BiblePassage,
  MemorizationQuestion,
  ContextQuestionItem,
} from "./types";
import { generateDailyWorkout as generateFallbackWorkout } from "./workout-generator";

function getDbConfig() {
  return {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    collectionId:
      process.env.NEXT_PUBLIC_APPWRITE_DAILY_WORKOUT_COLLECTION_ID ||
      "daily_workouts",
  };
}

let _databases: Databases | null = null;

function getDatabases() {
  if (!_databases) {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    _databases = new Databases(client);
  }
  return _databases;
}

const HARDCODED_THEMES = [
  {
    theme: "Faith and Endurance",
    passages: [
      {
        reference: "Hebrews 11:1",
        text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
        book: "Hebrews",
        chapter: 11,
        verses: "1",
        contextQuestion: {
          question:
            "What does this verse describe as the 'substance of things hoped for'?",
          options: ["Faith", "Love", "Hope", "Peace"],
          correctIndex: 0,
        },
      },
      {
        reference: "James 1:2-3",
        text: "My brethren, count it all joy when ye fall into divers temptations; Knowing this, that the trying of your faith worketh patience.",
        book: "James",
        chapter: 1,
        verses: "2-3",
        contextQuestion: {
          question:
            "What does the 'trying of your faith' produce according to James?",
          options: ["Anger", "Patience", "Sadness", "Confusion"],
          correctIndex: 1,
        },
      },
    ],
  },
  {
    theme: "Love and Compassion",
    passages: [
      {
        reference: "1 Corinthians 13:4",
        text: "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.",
        book: "1 Corinthians",
        chapter: 13,
        verses: "4",
        contextQuestion: {
          question: "What does charity NOT do according to this verse?",
          options: ["Suffer long", "Envy", "Be kind", "Exist"],
          correctIndex: 1,
        },
      },
      {
        reference: "John 15:12",
        text: "This is my commandment, That ye love one another, as I have loved you.",
        book: "John",
        chapter: 15,
        verses: "12",
        contextQuestion: {
          question: "How are we commanded to love one another?",
          options: [
            "As we love ourselves",
            "As the world loves",
            "As Jesus loved us",
            "Only if they love us back",
          ],
          correctIndex: 2,
        },
      },
    ],
  },
];

function generateHardcodedWorkoutData(date: string): {
  workout: Workout;
  theme: string;
} {
  const seed = date.split("-").reduce((acc, part) => acc + parseInt(part), 0);
  const themeData = HARDCODED_THEMES[seed % HARDCODED_THEMES.length];

  const mappedPassages: BiblePassage[] = themeData.passages.map((p) => ({
    reference: p.reference,
    text: p.text,
    book: p.book,
    chapter: p.chapter,
    verses: p.verses,
  }));

  const memorizationQuestions: MemorizationQuestion[] = themeData.passages.map(
    (p, i) => {
      const words = p.text.split(/\s+/);
      const numBlanks = Math.max(2, Math.floor(words.length * 0.3));
      const eligibleIndices = words
        .map((w, idx) => ({ word: w, index: idx }))
        .filter((w) => w.word.replace(/[^a-zA-Z]/g, "").length > 2);

      const blankedWords = eligibleIndices.slice(0, numBlanks).map((w) => ({
        index: w.index,
        word: w.word,
      }));

      return {
        id: `hc-mem-${date}-${i}`,
        passage: mappedPassages[i],
        blankedWords: blankedWords.sort((a, b) => a.index - b.index),
      };
    },
  );

  const contextQuestions: ContextQuestionItem[] = themeData.passages.map(
    (p, i) => ({
      id: `hc-ctx-${date}-${i}`,
      question: p.contextQuestion.question,
      options: p.contextQuestion.options,
      correctIndex: p.contextQuestion.correctIndex,
      passage: mappedPassages[i],
    }),
  );

  const workout: Workout = {
    id: `global-workout-${date}`,
    date,
    theme: themeData.theme,
    drills: [
      { type: "memorization", questions: memorizationQuestions },
      { type: "context", questions: contextQuestions },
      {
        type: "verse-match",
        pairs: mappedPassages.map((p) => ({
          reference: p.reference,
          text: p.text,
        })),
      },
    ],
    completed: false,
    scores: { memorization: 0, context: 0, verseMatch: 0, rearrange: 0 },
    totalScore: 0,
  };

  return { workout, theme: themeData.theme };
}

async function tryGenerateAIWorkout(
  date: string,
): Promise<{ workout: Workout; theme: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const themes = [
    "Faith and Endurance",
    "Love and Compassion",
    "God's Power and Majesty",
    "Forgiveness and Mercy",
    "Hope and Encouragement",
    "Wisdom and Guidance",
    "Peace and Stillness",
    "Service and Sacrifice",
    "Courage in Trials",
    "The Fruit of the Spirit",
    "Gratitude and Praise",
    "Holiness and Purity",
  ];
  const theme = themes[Math.floor(Math.random() * themes.length)];

  const prompt = `
    You are an expert Bible teacher creating a "Spiritual Workout" for a web app called Bible Gym.
    Target Date: ${date}.
    Theme: "${theme}".

    Generate 3 distinct Bible passages related to this theme.
    Passages should be from a classic version (KJV, ESV, or NIV).
    Provide a variety of lengths (1 to 3 verses).

    Return strictly as a JSON object matching this schema:
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
    NO markdown. NO explanations. Raw JSON ONLY.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const jsonStr = response.text ?? "";
  const data = JSON.parse(jsonStr);

  const mappedPassages: BiblePassage[] = data.passages.map((p: any) => ({
    reference: p.reference,
    text: p.text,
    book: p.book,
    chapter: p.chapter,
    verses: p.verses,
  }));

  const memorizationQuestions: MemorizationQuestion[] = data.passages.map(
    (p: any, i: number) => {
      const words = p.text.split(/\s+/);
      const numBlanks = Math.max(2, Math.floor(words.length * 0.3));
      const eligibleIndices = words
        .map((w: string, idx: number) => ({ word: w, index: idx }))
        .filter(
          (w: { word: string; index: number }) =>
            w.word.replace(/[^a-zA-Z]/g, "").length > 2,
        );

      const blankedWords = eligibleIndices
        .slice(0, numBlanks)
        .map((w: { word: string; index: number }) => ({
          index: w.index,
          word: w.word,
        }));

      return {
        id: `ai-mem-${date}-${i}`,
        passage: mappedPassages[i],
        blankedWords: blankedWords.sort((a: any, b: any) => a.index - b.index),
      };
    },
  );

  const contextQuestions: ContextQuestionItem[] = data.passages.map(
    (p: any, i: number) => ({
      id: `ai-ctx-${date}-${i}`,
      question: p.contextQuestion.question,
      options: p.contextQuestion.options,
      correctIndex: p.contextQuestion.correctIndex,
      passage: mappedPassages[i],
    }),
  );

  const workout: Workout = {
    id: `global-workout-${date}`,
    date,
    theme,
    drills: [
      { type: "memorization", questions: memorizationQuestions },
      { type: "context", questions: contextQuestions },
      {
        type: "verse-match",
        pairs: mappedPassages.map((p: BiblePassage) => ({
          reference: p.reference,
          text: p.text,
        })),
      },
    ],
    completed: false,
    scores: { memorization: 0, context: 0, verseMatch: 0, rearrange: 0 },
    totalScore: 0,
  };

  return { workout, theme };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * AI-First generation with immediate hard-coded fallback.
 */
export async function getOrCreateDailyWorkout(
  dateStr?: string,
  options: {
    isBackup?: boolean;
    maxRetries?: number;
    retryIntervalMs?: number;
  } = {},
): Promise<Workout> {
  const date = dateStr || new Date().toISOString().split("T")[0];
  const { isBackup = false, maxRetries = 0, retryIntervalMs = 60000 } = options;
  const { databaseId, collectionId } = getDbConfig();

  try {
    const existing = await getDatabases().listDocuments(
      databaseId,
      collectionId,
      [Query.equal("date", date), Query.limit(1)],
    );

    let existingDoc =
      existing.documents.length > 0 ? existing.documents[0] : null;

    // 1. If we already have an AI-generated workout, return it.
    if (existingDoc && existingDoc.isAiGenerated) {
      return JSON.parse(existingDoc.workoutData) as Workout;
    }

    // 2. Try Gemini with retry loop
    console.log(
      `Attempting AI generation for ${date} (Max Retries: ${maxRetries})...`,
    );

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { workout, theme } = await tryGenerateAIWorkout(date);

        if (existingDoc) {
          await getDatabases().updateDocument(
            databaseId,
            collectionId,
            existingDoc.$id,
            {
              workoutData: JSON.stringify(workout),
              isAiGenerated: true,
              isBackup: isBackup,
              theme: theme,
            },
          );
        } else {
          await getDatabases().createDocument(
            databaseId,
            collectionId,
            ID.unique(),
            {
              date,
              workoutData: JSON.stringify(workout),
              isAiGenerated: true,
              isBackup: isBackup,
              theme: theme,
            },
          );
        }
        return workout;
      } catch (aiError) {
        console.warn(`Gemini attempt ${attempt + 1} failed for ${date}.`);

        // If this was the first/only attempt and we have a fallback or need one immediately:
        if (attempt === 0) {
          // If we're not in a background/cron retry mode (maxRetries > 0),
          // or if we just want to return a result immediately on first failure:
          if (maxRetries === 0) {
            if (existingDoc) {
              return JSON.parse(existingDoc.workoutData) as Workout;
            }
            const { workout: hcWorkout, theme: hcTheme } =
              generateHardcodedWorkoutData(date);
            await getDatabases().createDocument(
              databaseId,
              collectionId,
              ID.unique(),
              {
                date,
                workoutData: JSON.stringify(hcWorkout),
                isAiGenerated: false,
                isBackup: isBackup,
                theme: hcTheme,
              },
            );
            return hcWorkout;
          }
        }

        if (attempt < maxRetries) {
          console.log(`Waiting ${retryIntervalMs}ms before next attempt...`);
          await sleep(retryIntervalMs);
        }
      }
    }

    // 3. All AI attempts failed. If we haven't returned yet, return hardcoded.
    if (existingDoc) {
      return JSON.parse(existingDoc.workoutData) as Workout;
    }
    const { workout: hcWorkout, theme: hcTheme } =
      generateHardcodedWorkoutData(date);
    await getDatabases().createDocument(databaseId, collectionId, ID.unique(), {
      date,
      workoutData: JSON.stringify(hcWorkout),
      isAiGenerated: false,
      isBackup: isBackup,
      theme: hcTheme,
    });
    return hcWorkout;
  } catch (error) {
    console.error("Critical error in getOrCreateDailyWorkout:", error);
    return await generateFallbackWorkout();
  }
}
