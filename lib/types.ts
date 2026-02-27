// ── Core Types ──────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  streak: number;
  totalScore: number;
  lastWorkoutDate: string | null; // ISO date string
  groupId: string | null;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  members: string[]; // user IDs
  createdBy: string;
  createdAt: string;
  groupChallenge?: Workout | null;
  challengeParticipants?: string[]; // user IDs who finished the current challenge
}

export interface GroupMember {
  userId: string;
  name: string;
  avatarInitials: string;
  weeklyScore: number;
  streak: number;
}

// ── Drill Types ─────────────────────────────────────────────

export interface MemorizationQuestion {
  id: string;
  passage: BiblePassage;
  blankedWords: { index: number; word: string }[];
}

export interface MemorizationDrill {
  type: "memorization";
  questions: MemorizationQuestion[];
}

export interface ContextQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  passage: BiblePassage;
}

export interface ContextChallengeDrill {
  type: "context";
  questions: ContextQuestionItem[];
}

export interface VerseMatchDrill {
  type: "verse-match";
  pairs: { reference: string; text: string }[];
}

export type Drill = MemorizationDrill | ContextChallengeDrill | VerseMatchDrill;

// ── Workout Types ───────────────────────────────────────────

export interface Workout {
  id: string;
  date: string; // ISO date
  drills: Drill[];
  completed: boolean;
  isGroupChallenge?: boolean;
  theme?: string;
  scores: {
    memorization: number;
    context: number;
    verseMatch: number;
  };
  totalScore: number;
}

export interface WorkoutResult {
  drillType: "memorization" | "context" | "verse-match";
  score: number;
  maxScore: number;
  details: string;
}

// ── Bible Data Types ────────────────────────────────────────

export interface BiblePassage {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verses: string;
}

export interface ContextQuestion {
  id: string;
  passageReference: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface VerseMatchItem {
  reference: string;
  text: string;
}

// ── App State ───────────────────────────────────────────────

export type AppView =
  | "landing"
  | "auth"
  | "dashboard"
  | "workout"
  | "workout-complete"
  | "group"
  | "profile"
  | "practice";

export interface DrillScore {
  earned: number;
  max: number;
  percentage: number;
}
