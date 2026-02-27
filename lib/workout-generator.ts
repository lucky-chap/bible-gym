import {
  BIBLE_PASSAGES,
  CONTEXT_QUESTIONS,
  VERSE_MATCH_ITEMS,
} from "./bible-data";
import {
  MemorizationDrill,
  ContextChallengeDrill,
  VerseMatchDrill,
  Workout,
} from "./types";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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

// Generate a memorization drill from passages
export function generateMemorizationDrill(
  passages: (typeof BIBLE_PASSAGES)[number][]
): MemorizationDrill {
  const questions = passages.map((passage, pIndex) => {
    const words = passage.text.split(" ");
    const numBlanks = Math.max(2, Math.floor(words.length * 0.3));

    const eligibleIndices = words
      .map((w, i) => ({ word: w, index: i }))
      .filter((w) => w.word.replace(/[^a-zA-Z]/g, "").length > 2);

    const shuffledEligible = shuffleArray(eligibleIndices);
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
  passages: (typeof BIBLE_PASSAGES)[number][]
): ContextChallengeDrill {
  const questions = passages.map((passage, pIndex) => {
    const relevantQuestions = CONTEXT_QUESTIONS.filter(
      (q) => q.passageReference === passage.reference
    );

    const question =
      relevantQuestions.length > 0
        ? relevantQuestions[Math.floor(Math.random() * relevantQuestions.length)]
        : CONTEXT_QUESTIONS[Math.floor(Math.random() * CONTEXT_QUESTIONS.length)];

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
export function generateVerseMatchDrill(): VerseMatchDrill {
  const shuffled = shuffleArray(VERSE_MATCH_ITEMS);
  const selected = shuffled.slice(0, 3); // 3 pairs to match (3 questions)

  return {
    type: "verse-match",
    pairs: selected.map((item) => ({
      reference: item.reference,
      text: item.text,
    })),
  };
}

// Generate today's workout
export function generateDailyWorkout(): Workout {
  const seed = getDaySeed();
  const rng = seededRandom(seed);

  // Pick 3 passages for today based on the day
  const passageIndices = [0, 1, 2].map(() => Math.floor(rng() * BIBLE_PASSAGES.length));
  const selectedPassages = passageIndices.map((index) => BIBLE_PASSAGES[index]);

  const workout: Workout = {
    id: `workout-${seed}`,
    date: new Date().toISOString().split("T")[0],
    drills: [
      generateMemorizationDrill(selectedPassages),
      generateContextDrill(selectedPassages),
      generateVerseMatchDrill(),
    ],
    completed: false,
    scores: {
      memorization: 0,
      context: 0,
      verseMatch: 0,
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
