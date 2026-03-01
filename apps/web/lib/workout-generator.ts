import {
  BIBLE_PASSAGES,
  CONTEXT_QUESTIONS,
  VERSE_MATCH_ITEMS,
} from "./bible-data";
import {
  MemorizationDrill,
  ContextChallengeDrill,
  VerseMatchDrill,
  RearrangeDrill,
  Workout,
} from "./types";

function shuffleArray<T>(arr: T[], rng?: () => number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((rng ? rng() : Math.random()) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getDaySeed(): number {
  const today = new Date();
  return (
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  );
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate a memorization drill from passages
export function generateMemorizationDrill(
  passages: (typeof BIBLE_PASSAGES)[number][],
  rng: () => number,
): MemorizationDrill {
  const questions = passages.map((passage, pIndex) => {
    const words = passage.text.split(" ");
    const numBlanks = Math.max(2, Math.floor(words.length * 0.3));

    const eligibleIndices = words
      .map((w, i) => ({ word: w, index: i }))
      .filter((w) => w.word.replace(/[^a-zA-Z]/g, "").length > 2);

    const shuffledEligible = shuffleArray(eligibleIndices, rng);
    const blankedWords = shuffledEligible.slice(0, numBlanks).map((w) => ({
      index: w.index,
      word: w.word,
    }));
    
    return {
      id: `mem-${pIndex}`,
      passage,
      blankedWords: blankedWords.sort((a, b) => a.index - b.index),
    };
  });

  return {
    type: "memorization",
    questions,
  };
}

// Generate a context challenge drill
export function generateContextDrill(
  passages: (typeof BIBLE_PASSAGES)[number][],
  rng: () => number,
): ContextChallengeDrill {
  const questions = passages.map((passage, pIndex) => {
    const relevantQuestions = CONTEXT_QUESTIONS.filter(
      (q) => q.passageReference === passage.reference
    );

    const question =
      relevantQuestions.length > 0
        ? relevantQuestions[Math.floor(rng() * relevantQuestions.length)]
        : CONTEXT_QUESTIONS[Math.floor(rng() * CONTEXT_QUESTIONS.length)];

    return {
      id: `ctx-${pIndex}`,
      question: question.question,
      options: question.options,
      correctIndex: question.correctIndex,
      passage,
    };
  });

  return {
    type: "context",
    questions,
  };
}

// Generate a verse match drill
export function generateVerseMatchDrill(rng: () => number): VerseMatchDrill {
  const shuffled = shuffleArray(VERSE_MATCH_ITEMS, rng);
  const selected = shuffled.slice(0, 3); // 3 pairs to match (3 questions)

  return {
    type: "verse-match",
    pairs: selected.map((item) => ({
      reference: item.reference,
      text: item.text,
    })),
  };
}

// Generate a rearrange drill
export function generateRearrangeDrill(
  passages: (typeof BIBLE_PASSAGES)[number][],
  rng: () => number,
): RearrangeDrill {
  // Pick a passage with multiple sentences/verses
  const multiVersePassages = passages.filter((p) => p.text.includes(".") || p.text.includes(";"));
  const passage = multiVersePassages.length > 0
    ? multiVersePassages[Math.floor(rng() * multiVersePassages.length)]
    : passages[0];

  // Split into units (sentences or verses)
  const units = passage.text
    .split(/(?<=[.;?])\s+/)
    .filter((u) => u.trim().length > 0)
    .map((text, index) => ({
      id: `unit-${index}`,
      text: text.trim(),
      originalIndex: index,
    }));

  return {
    type: "rearrange",
    passage,
    shuffledVerses: shuffleArray(units, rng),
  };
}

// Generate today's workout
export function generateDailyWorkout(userId?: string): Workout {
  const seed = getDaySeed();
  const finalSeed = userId ? seed + hashString(userId) : seed;
  const rng = seededRandom(finalSeed);

  // Pick 3 passages for today based on the day
  const passageIndices = [0, 1, 2].map(() => Math.floor(rng() * BIBLE_PASSAGES.length));
  const selectedPassages = passageIndices.map((index) => BIBLE_PASSAGES[index]);

  const workout: Workout = {
    id: `workout-${finalSeed}`,
    date: new Date().toISOString().split("T")[0],
    drills: [
      generateMemorizationDrill(selectedPassages, rng),
      generateContextDrill(selectedPassages, rng),
      generateVerseMatchDrill(rng),
      generateRearrangeDrill(selectedPassages, rng),
    ],
    completed: false,
    scores: {
      memorization: 0,
      context: 0,
      verseMatch: 0,
      rearrange: 0,
    },
    totalScore: 0,
  };

  return workout;
}

// Score a memorization drill
export function scoreMemorizationDrill(
  drill: MemorizationDrill,
  answers: Record<string, Record<number, string>>
): number {
  let correct = 0;
  let total = 0;

  for (const question of drill.questions) {
    total += question.blankedWords.length;
    const questionAnswers = answers[question.id] || {};
    
    for (const blank of question.blankedWords) {
      const answer = (questionAnswers[blank.index] || "").trim().toLowerCase();
      const expected = blank.word
        .replace(/[^a-zA-Z]/g, "")
        .trim()
        .toLowerCase();
      if (answer === expected) {
        correct++;
      }
    }
  }

  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

// Score a context challenge
export function scoreContextDrill(
  drill: ContextChallengeDrill,
  selectedIndices: Record<string, number>
): number {
  let correct = 0;
  const total = drill.questions.length;

  for (const question of drill.questions) {
    if (selectedIndices[question.id] === question.correctIndex) {
      correct++;
    }
  }

  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

// Score a verse match drill
export function scoreVerseMatchDrill(
  drill: VerseMatchDrill,
  matches: Record<string, string>
): number {
  let correct = 0;
  const total = drill.pairs.length;

  for (const pair of drill.pairs) {
    if (matches[pair.reference] === pair.text) {
      correct++;
    }
  }

  return Math.round((correct / total) * 100);
}
// Score a rearrange drill
export function scoreRearrangeDrill(
  drill: RearrangeDrill,
  currentOrder: { id: string; text: string; originalIndex: number }[]
): number {
  let correct = 0;
  const total = drill.shuffledVerses.length;

  currentOrder.forEach((item, index) => {
    if (item.originalIndex === index) {
      correct++;
    }
  });

  return Math.round((correct / total) * 100);
}
