import {
  User,
  Group,
  GroupMember,
  Workout,
  AppView,
  PracticeConfig,
  VerseMastery,
  MasteryStats,
  MasteryLevel,
  BiblePassage,
} from "../types";

export type {
  User,
  Group,
  GroupMember,
  Workout,
  AppView,
  PracticeConfig,
  VerseMastery,
  MasteryStats,
  MasteryLevel,
  BiblePassage,
};

export interface AppState {
  user: User | null;
  currentView: AppView | "mastery";
  workout: Workout | null;
  currentDrillIndex: number;
  practiceDrillType:
    | "memorization"
    | "context"
    | "verse-match"
    | "rearrange"
    | "ai-themed"
    | null;
  practiceConfig: PracticeConfig | null;
  groups: Group[];
  groupMembers: GroupMember[];
  verseMastery: Record<string, VerseMastery>;
  masteryStats: MasteryStats;
  isLoading: boolean;
  returnView: AppView | "mastery" | null;
}

export const initialState: AppState = {
  user: null,
  currentView: "landing",
  workout: null,
  currentDrillIndex: 0,
  practiceDrillType: null,
  practiceConfig: null,
  groups: [],
  groupMembers: [],
  verseMastery: {},
  masteryStats: {
    totalMastered: 0,
    streak: 0,
    consistencyScore: 0,
  },
  isLoading: true,
  returnView: null,
};

export type Action =
  | { type: "SET_USER"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_VIEW"; payload: AppView }
  | { type: "START_WORKOUT"; payload: Workout }
  | { type: "NEXT_DRILL" }
  | {
      type: "COMPLETE_DRILL";
      payload: { drillType: string; score: number };
    }
  | { type: "COMPLETE_WORKOUT" }
  | { type: "SET_GROUPS"; payload: Group[] }
  | { type: "JOIN_GROUP"; payload: Group }
  | { type: "SET_GROUP_MEMBERS"; payload: GroupMember[] }
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "START_PRACTICE";
      payload: {
        type:
          | "memorization"
          | "context"
          | "verse-match"
          | "rearrange"
          | "ai-themed";
        config?: PracticeConfig;
      };
    }
  | { type: "SET_GROUP_CHALLENGE"; payload: Workout }
  | { type: "DELETE_GROUP_CHALLENGE" }
  | {
      type: "UPDATE_VERSE_MASTERY";
      payload: { id: string; mastery: VerseMastery };
    }
  | {
      type: "COMPLETE_MASTERY_LEVEL";
      payload: {
        id: string;
        level: MasteryLevel;
        accuracy: number;
        time: number;
      };
    }
  | {
      type: "LOG_PRACTICE_SCORE";
      payload: {
        drillType: string;
        score: number;
        accuracy: number;
        config: PracticeConfig | null;
      };
    }
  | { type: "LOAD_STATE"; payload: Partial<AppState> }
  | { type: "INITIALIZE_USER"; payload: User }
  | { type: "EXIT_DRILL" };
