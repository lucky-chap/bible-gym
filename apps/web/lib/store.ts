"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from "react";
import React from "react";
import { useRouter } from "next/navigation";
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
} from "./types";
import { generateDailyWorkout } from "./workout-generator";
import {
  account,
  databases,
  APPWRITE_DB_ID,
  APPWRITE_USERS_COLLECTION_ID,
  APPWRITE_MASTERY_COLLECTION_ID,
  APPWRITE_WORKOUTS_COLLECTION_ID,
  APPWRITE_PRACTICE_COLLECTION_ID,
  APPWRITE_GROUPS_COLLECTION_ID,
} from "./appwrite";
import { OAuthProvider, ID, Query } from "appwrite";

// ── State Shape ─────────────────────────────────────────────

interface AppState {
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

const initialState: AppState = {
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

// ── Actions ─────────────────────────────────────────────────

type Action =
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
  | { type: "INITIALIZE_APPWRITE_USER"; payload: User }
  | { type: "EXIT_DRILL" };

// ── Reducer ─────────────────────────────────────────────────

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "INITIALIZE_APPWRITE_USER":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        currentView:
          state.currentView === "landing" ? "dashboard" : state.currentView,
      };

    case "LOGOUT":
      return { ...initialState, isLoading: false, currentView: "landing" };

    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    case "EXIT_DRILL":
      return {
        ...state,
        currentView: state.returnView || "dashboard",
        workout: null,
        currentDrillIndex: 0,
        practiceDrillType: null,
        practiceConfig: null,
      };

    case "START_WORKOUT":
      return {
        ...state,
        workout: action.payload,
        currentDrillIndex: 0,
        currentView: "workout",
        returnView: state.currentView,
      };

    case "NEXT_DRILL":
      return {
        ...state,
        currentDrillIndex: state.currentDrillIndex + 1,
      };

    case "COMPLETE_DRILL": {
      if (!state.workout) return state;
      const scores = { ...state.workout.scores };
      if (action.payload.drillType === "memorization")
        scores.memorization = action.payload.score;
      if (action.payload.drillType === "context")
        scores.context = action.payload.score;
      if (action.payload.drillType === "verse-match")
        scores.verseMatch = action.payload.score;
      if (action.payload.drillType === "rearrange")
        scores.rearrange = action.payload.score;

      return {
        ...state,
        workout: {
          ...state.workout,
          scores,
          totalScore:
            scores.memorization +
            scores.context +
            scores.verseMatch +
            (scores.rearrange || 0),
        },
      };
    }

    case "COMPLETE_WORKOUT": {
      if (!state.workout || !state.user) return state;

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      const isConsecutive = state.user.lastWorkoutDate === yesterday;
      const alreadyDoneToday = state.user.lastWorkoutDate === today;

      const newStreak = alreadyDoneToday
        ? state.user.streak
        : isConsecutive
          ? state.user.streak + 1
          : 1;

      const updatedUser: User | null = state.user
        ? {
            ...state.user,
            streak: newStreak,
            totalScore: state.user.totalScore + state.workout!.totalScore,
            weeklyScore:
              state.workout!.isGroupChallenge || state.user.groupId
                ? (state.user.weeklyScore || 0) + state.workout!.totalScore
                : state.user.weeklyScore,
            lastWorkoutDate: today,
            memorizationTotal:
              (state.user.memorizationTotal || 0) +
              (state.workout!.scores.memorization || 0),
            contextTotal:
              (state.user.contextTotal || 0) +
              (state.workout!.scores.context || 0),
            verseMatchTotal:
              (state.user.verseMatchTotal || 0) +
              (state.workout!.scores.verseMatch || 0),
            rearrangeTotal:
              (state.user.rearrangeTotal || 0) +
              (state.workout!.scores.rearrange || 0),
          }
        : null;

      const updatedGroupMembers = state.groupMembers
        .map((m) =>
          m.userId === state.user?.id
            ? {
                ...m,
                weeklyScore: m.weeklyScore + state.workout!.totalScore,
                streak: updatedUser ? updatedUser.streak : state.user.streak,
              }
            : m,
        )
        .sort((a, b) => b.weeklyScore - a.weeklyScore);

      let updatedGroups = state.groups;
      if (state.workout.isGroupChallenge && state.user.groupId) {
        updatedGroups = state.groups.map((g) => {
          if (g.id === state.user!.groupId) {
            const participants = g.challengeParticipants || [];
            if (!participants.includes(state.user!.id)) {
              return {
                ...g,
                challengeParticipants: [...participants, state.user!.id],
              };
            }
          }
          return g;
        });
      }

      // Sync progress to Appwrite
      if (state.user && updatedUser) {
        // 1. Update User Profile
        databases
          .updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_USERS_COLLECTION_ID,
            state.user.id,
            {
              streak: updatedUser.streak,
              totalScore: updatedUser.totalScore,
              weeklyScore: updatedUser.weeklyScore,
              lastWorkoutDate: updatedUser.lastWorkoutDate,
              memorizationTotal: updatedUser.memorizationTotal,
              contextTotal: updatedUser.contextTotal,
              verseMatchTotal: updatedUser.verseMatchTotal,
              rearrangeTotal: updatedUser.rearrangeTotal,
            },
          )
          .catch((e) => console.error("Failed to sync user profile", e));

        // 2. Log Workout Result
        databases
          .createDocument(
            APPWRITE_DB_ID,
            APPWRITE_WORKOUTS_COLLECTION_ID,
            ID.unique(),
            {
              userId: state.user.id,
              date: today,
              totalScore: state.workout.totalScore,
              memorizationScore: state.workout.scores.memorization || 0,
              contextScore: state.workout.scores.context || 0,
              verseMatchScore: state.workout.scores.verseMatch || 0,
              rearrangeScore: state.workout.scores.rearrange || 0,
            },
          )
          .catch((e) => console.error("Failed to log workout", e));

        // 3. Update Group Challenge Participants
        if (state.workout.isGroupChallenge && state.user.groupId) {
          const group = state.groups.find((g) => g.id === state.user!.groupId);
          if (group) {
            const participants = group.challengeParticipants || [];
            if (!participants.includes(state.user.id)) {
              databases
                .updateDocument(
                  APPWRITE_DB_ID,
                  APPWRITE_GROUPS_COLLECTION_ID,
                  group.id,
                  {
                    challengeParticipants: [...participants, state.user.id],
                  },
                )
                .catch((e) =>
                  console.error("Failed to update group participants", e),
                );
            }
          }
        }
      }

      return {
        ...state,
        user: updatedUser,
        groups: updatedGroups,
        groupMembers: updatedGroupMembers,
        workout: { ...state.workout, completed: true },
        currentView: "workout-complete",
      };
    }

    case "SET_GROUPS":
      return { ...state, groups: action.payload };

    case "JOIN_GROUP": {
      const user = state.user;
      if (!user || user.groupId) return state;
      return {
        ...state,
        user: { ...user, groupId: action.payload.id },
        groups: [...state.groups, action.payload],
      };
    }

    case "SET_GROUP_MEMBERS":
      return { ...state, groupMembers: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "START_PRACTICE":
      return {
        ...state,
        currentView: "practice",
        practiceDrillType: action.payload.type,
        practiceConfig: action.payload.config || null,
        returnView: state.currentView,
      };

    case "LOG_PRACTICE_SCORE": {
      if (state.user) {
        const updatedUser: User = {
          ...state.user,
          totalScore: state.user.totalScore + action.payload.score,
        };

        if (action.payload.drillType === "memorization") {
          updatedUser.memorizationTotal =
            (state.user.memorizationTotal || 0) + action.payload.score;
        } else if (action.payload.drillType === "context") {
          updatedUser.contextTotal =
            (state.user.contextTotal || 0) + action.payload.score;
        } else if (action.payload.drillType === "verse-match") {
          updatedUser.verseMatchTotal =
            (state.user.verseMatchTotal || 0) + action.payload.score;
        } else if (action.payload.drillType === "rearrange") {
          updatedUser.rearrangeTotal =
            (state.user.rearrangeTotal || 0) + action.payload.score;
        }

        return {
          ...state,
          user: updatedUser,
        };
      }
      return state;
    }

    case "SET_GROUP_CHALLENGE": {
      if (!state.user?.groupId) return state;
      const updatedGroups = state.groups.map((g) =>
        g.id === state.user!.groupId
          ? { ...g, groupChallenge: action.payload, challengeParticipants: [] }
          : g,
      );
      return { ...state, groups: updatedGroups };
    }

    case "DELETE_GROUP_CHALLENGE": {
      if (!state.user?.groupId) return state;
      const updatedGroups = state.groups.map((g) =>
        g.id === state.user!.groupId
          ? { ...g, groupChallenge: null, challengeParticipants: [] }
          : g,
      );
      return { ...state, groups: updatedGroups };
    }

    case "UPDATE_VERSE_MASTERY":
      return {
        ...state,
        verseMastery: {
          ...state.verseMastery,
          [action.payload.id]: action.payload.mastery,
        },
      };

    case "COMPLETE_MASTERY_LEVEL": {
      const { id, level, accuracy, time } = action.payload;
      const current = state.verseMastery[id];
      if (!current) return state;

      const nextLevel = (level < 5 ? level + 1 : 5) as MasteryLevel;
      const isMastered = nextLevel === 5 && accuracy >= 90;

      const updatedMastery: VerseMastery = {
        ...current,
        currentLevel: accuracy >= 90 ? nextLevel : level,
        bestAccuracy: Math.max(current.bestAccuracy, accuracy),
        bestTime:
          current.bestTime === 0 ? time : Math.min(current.bestTime, time),
        status: isMastered ? "mastered" : current.status,
        lastPracticed: new Date().toISOString(),
      };

      const updatedStats = { ...state.masteryStats };
      if (isMastered && current.status !== "mastered") {
        updatedStats.totalMastered += 1;
      }

      // Sync Mastery to Appwrite
      if (state.user) {
        databases
          .getDocument(
            APPWRITE_DB_ID,
            APPWRITE_MASTERY_COLLECTION_ID,
            `${state.user!.id}_${id}`,
          )
          .then(() => {
            // Update existing
            return databases.updateDocument(
              APPWRITE_DB_ID,
              APPWRITE_MASTERY_COLLECTION_ID,
              `${state.user!.id}_${id}`,
              {
                currentLevel: updatedMastery.currentLevel,
                bestAccuracy: updatedMastery.bestAccuracy,
                bestTime: updatedMastery.bestTime,
                status: updatedMastery.status,
                lastPracticed: updatedMastery.lastPracticed,
              },
            );
          })
          .catch((e) => {
            // Document might not exist, create it
            if (e.code === 404) {
              return databases.createDocument(
                APPWRITE_DB_ID,
                APPWRITE_MASTERY_COLLECTION_ID,
                `${state.user!.id}_${id}`, // Predictable composite ID
                {
                  userId: state.user!.id,
                  referenceId: id,
                  passageReference: updatedMastery.passage.reference,
                  passageText: updatedMastery.passage.text,
                  currentLevel: updatedMastery.currentLevel,
                  bestAccuracy: updatedMastery.bestAccuracy,
                  bestTime: updatedMastery.bestTime,
                  status: updatedMastery.status,
                  lastPracticed: updatedMastery.lastPracticed,
                },
              );
            }
            console.error("Failed to sync mastery to Appwrite", e);
          });

        // Also update User profile points for Mastery
        const earnedPoints = Math.round(accuracy);
        databases
          .updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_USERS_COLLECTION_ID,
            state.user.id,
            {
              totalScore: state.user.totalScore + earnedPoints,
              masteryTotal: (state.user.masteryTotal || 0) + earnedPoints,
            },
          )
          .catch((e) =>
            console.error("Failed to update user mastery points:", e),
          );
      }

      return {
        ...state,
        user: state.user
          ? {
              ...state.user,
              totalScore: state.user.totalScore + Math.round(accuracy),
              masteryTotal:
                (state.user.masteryTotal || 0) + Math.round(accuracy),
            }
          : null,
        verseMastery: {
          ...state.verseMastery,
          [id]: updatedMastery,
        },
        masteryStats: updatedStats,
      };
    }

    case "LOAD_STATE":
      return { ...state, ...action.payload, isLoading: false };

    case "INITIALIZE_APPWRITE_USER":
      return { ...state, user: action.payload, isLoading: false };

    default:
      return state;
  }
}

// ── Context ─────────────────────────────────────────────────

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<Action>>(() => {});

export function useAppState() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}

// ── Helper Hooks ────────────────────────────────────────────

export function useAuth() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const login = async () => {
    try {
      await account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/`,
      );
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      dispatch({ type: "LOGOUT" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("bible-gym-state");
      }
      router.push("/");
    }
  };

  return { user: state.user, login, logout, isAuthenticated: !!state.user };
}

export function useWorkout() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const startWorkout = async (aiDrill?: Workout["drills"][0]) => {
    try {
      // 1. Fetch today's global workout
      const response = await fetch("/api/daily-workout");
      if (!response.ok) throw new Error("Failed to fetch daily workout");
      const workout = await response.json();

      if (aiDrill) {
        // Replace one random drill with the AI one (keeping existing legacy feature)
        const randomIndex = Math.floor(Math.random() * 3);
        workout.drills[randomIndex] = aiDrill;
      }

      dispatch({ type: "START_WORKOUT", payload: workout });
      router.push("/workout");
    } catch (error) {
      console.error("Failed to start daily workout:", error);
      // Optional: Client-side fallback if API is completely down
      const fallback = await generateDailyWorkout(state.user?.id);
      dispatch({ type: "START_WORKOUT", payload: fallback });
      router.push("/workout");
    }
  };

  const startGroupChallenge = (challenge: Workout) => {
    dispatch({ type: "START_WORKOUT", payload: challenge });
    router.push("/workout");
  };

  const handleDrillComplete = async (drillType: string, score: number) => {
    dispatch({ type: "COMPLETE_DRILL", payload: { drillType, score } });

    if (
      state.workout &&
      state.currentDrillIndex < state.workout.drills.length - 1
    ) {
      dispatch({ type: "NEXT_DRILL" });
    } else {
      // PERSISTENCE LOGIC MOVED HERE, calculating final score inline to avoid stale state
      if (state.workout && state.user) {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];

        const isConsecutive = state.user.lastWorkoutDate === yesterday;
        const alreadyDoneToday = state.user.lastWorkoutDate === today;

        const newStreak = alreadyDoneToday
          ? state.user.streak
          : isConsecutive
            ? state.user.streak + 1
            : 1;

        const updatedScores = { ...state.workout.scores };
        if (drillType === "memorization") updatedScores.memorization = score;
        if (drillType === "context") updatedScores.context = score;
        if (drillType === "verse-match") updatedScores.verseMatch = score;
        if (drillType === "rearrange") updatedScores.rearrange = score;

        const finalWorkoutTotal =
          updatedScores.memorization +
          updatedScores.context +
          updatedScores.verseMatch +
          (updatedScores.rearrange || 0);

        const totalScore = state.user.totalScore + finalWorkoutTotal;
        const weeklyScore = state.workout.isGroupChallenge
          ? (state.user.weeklyScore || 0) + finalWorkoutTotal
          : state.user.weeklyScore;

        try {
          // 1. Sync user progress
          await databases.updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_USERS_COLLECTION_ID,
            state.user.id,
            {
              streak: newStreak,
              totalScore,
              weeklyScore,
              lastWorkoutDate: today,
            },
          );

          // 2. Log workout history
          await databases.createDocument(
            APPWRITE_DB_ID,
            APPWRITE_WORKOUTS_COLLECTION_ID,
            ID.unique(),
            {
              userId: state.user.id,
              date: today,
              totalScore: finalWorkoutTotal,
              memorizationScore: updatedScores.memorization,
              contextScore: updatedScores.context,
              verseMatchScore: updatedScores.verseMatch,
              rearrangeScore: updatedScores.rearrange,
            },
          );
        } catch (e) {
          console.error("Failed to sync workout data:", e);
        }
      }

      dispatch({ type: "COMPLETE_WORKOUT" });
      router.push("/workout-complete");
    }
  };

  const exitWorkout = () => {
    dispatch({ type: "EXIT_DRILL" });
    const target = state.returnView === "group" ? "/group" : "/dashboard";
    router.push(target);
  };

  return {
    workout: state.workout,
    currentDrillIndex: state.currentDrillIndex,
    startWorkout,
    startGroupChallenge,
    handleDrillComplete,
    exitWorkout,
  };
}

export function usePractice() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const startPractice = (
    type:
      | "memorization"
      | "context"
      | "verse-match"
      | "rearrange"
      | "ai-themed",
    config?: PracticeConfig,
  ) => {
    dispatch({ type: "START_PRACTICE", payload: { type, config } });
    router.push("/practice");
  };

  const exitPractice = () => {
    dispatch({ type: "EXIT_DRILL" });
    const target = state.returnView === "group" ? "/group" : "/dashboard";
    router.push(target);
  };

  const logPractice = async (score: number, accuracy: number = score) => {
    if (!state.practiceDrillType || !state.user) return;

    // 1. Log practice history
    databases
      .createDocument(
        APPWRITE_DB_ID,
        APPWRITE_PRACTICE_COLLECTION_ID,
        ID.unique(),
        {
          userId: state.user.id,
          timestamp: new Date().toISOString(),
          drillType: state.practiceDrillType,
          score,
          accuracy,
          config: state.practiceConfig
            ? JSON.stringify(state.practiceConfig)
            : null,
        },
      )
      .catch((e) => console.error("Failed to log practice history:", e));

    // 2. Update user score
    const updatedStats: Partial<User> = {
      totalScore: state.user.totalScore + score,
    };

    if (state.practiceDrillType === "memorization") {
      updatedStats.memorizationTotal =
        (state.user.memorizationTotal || 0) + score;
    } else if (state.practiceDrillType === "context") {
      updatedStats.contextTotal = (state.user.contextTotal || 0) + score;
    } else if (state.practiceDrillType === "verse-match") {
      updatedStats.verseMatchTotal = (state.user.verseMatchTotal || 0) + score;
    } else if (state.practiceDrillType === "rearrange") {
      updatedStats.rearrangeTotal = (state.user.rearrangeTotal || 0) + score;
    }

    databases
      .updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_USERS_COLLECTION_ID,
        state.user.id,
        updatedStats,
      )
      .catch((e) => console.error("Failed to update user score:", e));

    dispatch({
      type: "LOG_PRACTICE_SCORE",
      payload: {
        drillType: state.practiceDrillType,
        score,
        accuracy,
        config: state.practiceConfig,
      },
    });
  };

  return {
    practiceDrillType: state.practiceDrillType,
    practiceConfig: state.practiceConfig,
    startPractice,
    exitPractice,
    logPractice,
  };
}

export function useMastery() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const startMastery = (verse: BiblePassage) => {
    // Initialize mastery if it doesn't exist
    if (!state.verseMastery[verse.reference]) {
      const initialMastery: VerseMastery = {
        id: verse.reference,
        passage: verse,
        currentLevel: 1,
        bestAccuracy: 0,
        bestTime: 0,
        status: "learning",
        lastPracticed: new Date().toISOString(),
      };
      dispatch({
        type: "UPDATE_VERSE_MASTERY",
        payload: { id: verse.reference, mastery: initialMastery },
      });
    }
    dispatch({ type: "SET_VIEW", payload: "practice" }); // Borrow practice view for now or implicitly track
    router.push(`/mastery/${encodeURIComponent(verse.reference)}`);
  };

  const completeLevel = (
    id: string,
    level: MasteryLevel,
    accuracy: number,
    time: number,
  ) => {
    dispatch({
      type: "COMPLETE_MASTERY_LEVEL",
      payload: { id, level, accuracy, time },
    });
  };

  return {
    verseMastery: state.verseMastery,
    masteryStats: state.masteryStats,
    startMastery,
    completeLevel,
  };
}

export function useGroups() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const refreshGroupData = async (groupId: string) => {
    try {
      // 1. Fetch group details
      const groupDoc = await databases.getDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        groupId,
      );
      dispatch({ type: "SET_GROUPS", payload: [groupDoc as any] });

      // 2. Fetch members (users with this groupId)
      const usersResponse = await databases.listDocuments(
        APPWRITE_DB_ID,
        APPWRITE_USERS_COLLECTION_ID,
        [Query.equal("groupId", groupId), Query.limit(100)],
      );

      const members: GroupMember[] = usersResponse.documents.map(
        (doc: any) => ({
          userId: doc.$id,
          name: doc.name,
          avatarInitials: doc.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
          weeklyScore: doc.weeklyScore || 0,
          streak: doc.streak || 0,
        }),
      );

      dispatch({
        type: "SET_GROUP_MEMBERS",
        payload: members.sort((a, b) => b.weeklyScore - a.weeklyScore),
      });
    } catch (e) {
      console.error("Failed to refresh group data:", e);
    }
  };

  const createGroup = async (name: string): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const groupId = ID.unique();
      const group: Group = {
        id: groupId,
        name,
        inviteCode: generateInviteCode(),
        members: [state.user.id],
        createdBy: state.user.id,
        createdAt: new Date().toISOString(),
        groupChallenge: null,
        challengeParticipants: [],
      };

      // 1. Create group document
      await databases.createDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        groupId,
        {
          name: group.name,
          inviteCode: group.inviteCode,
          members: group.members,
          createdBy: group.createdBy,
          createdAt: group.createdAt,
          groupChallenge: null,
          challengeParticipants: [],
        },
      );

      // 2. Update user profile with new groupId
      await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_USERS_COLLECTION_ID,
        state.user.id,
        { groupId: groupId },
      );

      dispatch({ type: "JOIN_GROUP", payload: group });
      await refreshGroupData(groupId);
      return true;
    } catch (e) {
      console.error("Failed to create group:", e);
      return false;
    }
  };

  const joinGroup = async (inviteCode: string) => {
    if (!state.user) return false;

    try {
      // 1. Find group by invite code
      const response = await databases.listDocuments(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        [Query.equal("inviteCode", inviteCode)],
      );

      if (response.documents.length === 0) return false;

      const groupDoc = response.documents[0];
      const groupId = groupDoc.$id;
      const currentMembers = groupDoc.members || [];

      if (!currentMembers.includes(state.user.id)) {
        // 2. Add user to group members list
        await databases.updateDocument(
          APPWRITE_DB_ID,
          APPWRITE_GROUPS_COLLECTION_ID,
          groupId,
          {
            members: [...currentMembers, state.user.id],
          },
        );
      }

      // 3. Update user profile
      await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_USERS_COLLECTION_ID,
        state.user.id,
        { groupId: groupId },
      );

      dispatch({ type: "JOIN_GROUP", payload: groupDoc as any });
      await refreshGroupData(groupId);
      return true;
    } catch (e) {
      console.error("Failed to join group:", e);
      return false;
    }
  };

  const setGroupChallenge = async (challenge: Workout) => {
    if (!state.user?.groupId) return;

    try {
      await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        state.user.groupId,
        {
          groupChallenge: JSON.stringify(challenge),
          challengeParticipants: [],
        },
      );
      dispatch({ type: "SET_GROUP_CHALLENGE", payload: challenge });
    } catch (e) {
      console.error("Failed to set group challenge:", e);
    }
  };

  const deleteGroupChallenge = async () => {
    if (!state.user?.groupId) return;

    try {
      await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        state.user.groupId,
        {
          groupChallenge: null,
          challengeParticipants: [],
        },
      );
      dispatch({ type: "DELETE_GROUP_CHALLENGE" });
    } catch (e) {
      console.error("Failed to delete group challenge:", e);
    }
  };

  return {
    groupMembers: state.groupMembers,
    userGroup: state.groups.find((g) => g.id === state.user?.groupId),
    createGroup,
    joinGroup,
    setGroupChallenge,
    deleteGroupChallenge,
    refreshGroupData,
  };
}

// ── Helpers ─────────────────────────────────────────────────

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateMockLeaderboard(
  dispatch: Dispatch<Action>,
  user: User,
  _group: Group,
) {
  const mockNames = [
    "Sarah K.",
    "David M.",
    "Ruth O.",
    "James L.",
    "Esther A.",
  ];

  const members: GroupMember[] = [
    {
      userId: user.id,
      name: user.name,
      avatarInitials: user.avatarInitials,
      weeklyScore: user.totalScore,
      streak: user.streak,
    },
    ...mockNames.map((name, i) => ({
      userId: `mock-${i}`,
      name,
      avatarInitials: name
        .split(" ")
        .map((n) => n[0])
        .join(""),
      weeklyScore: Math.floor(Math.random() * 1500) + 300,
      streak: Math.floor(Math.random() * 14) + 1,
    })),
  ].sort((a, b) => b.weeklyScore - a.weeklyScore);

  dispatch({ type: "SET_GROUP_MEMBERS", payload: members });
}

// ── Provider ────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount and check Appwrite session
  useEffect(() => {
    const initApp = async () => {
      try {
        // 1. Try to restore local UI state first (fast)
        const saved = localStorage.getItem("bible-gym-state");
        if (saved) {
          const parsed = JSON.parse(saved);
          dispatch({
            type: "LOAD_STATE",
            payload: {
              groups: parsed.groups || [],
              groupMembers: parsed.groupMembers || [],
              workout: parsed.workout || null,
              currentDrillIndex: parsed.currentDrillIndex || 0,
              practiceDrillType: parsed.practiceDrillType || null,
              practiceConfig: parsed.practiceConfig || null,
              verseMastery: parsed.verseMastery || {},
              masteryStats: parsed.masteryStats || initialState.masteryStats,
              returnView: parsed.returnView || null,
            } as Partial<AppState>,
          });
        }

        // 2. Check Appwrite for active session (source of truth)
        const currentAccount = await account.get();
        if (currentAccount) {
          // Helper for weekly resets
          const getStartOfWeek = (date: Date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            d.setDate(diff);
            d.setHours(0, 0, 0, 0);
            return d;
          };

          const currentStartOfWeek = getStartOfWeek(new Date());

          const fetchAndDispatchGroupData = async (groupId: string) => {
            try {
              // 1. Fetch group details
              const groupDoc = await databases.getDocument(
                APPWRITE_DB_ID,
                APPWRITE_GROUPS_COLLECTION_ID,
                groupId,
              );

              // Parse group challenge from JSON string
              const parsedGroupDoc = {
                ...groupDoc,
                id: groupDoc.$id,
                groupChallenge: groupDoc.groupChallenge
                  ? JSON.parse(groupDoc.groupChallenge)
                  : null,
              } as unknown as Group;

              // 2. Fetch members (users with this groupId)
              const usersResponse = await databases.listDocuments(
                APPWRITE_DB_ID,
                APPWRITE_USERS_COLLECTION_ID,
                [Query.equal("groupId", groupId), Query.limit(100)],
              );

              const members: GroupMember[] = usersResponse.documents.map(
                (doc: any) => ({
                  userId: doc.$id,
                  name: doc.name,
                  avatarInitials: doc.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2),
                  weeklyScore: doc.weeklyScore || 0,
                  streak: doc.streak || 0,
                }),
              );

              dispatch({
                type: "LOAD_STATE",
                payload: {
                  groups: [parsedGroupDoc],
                  groupMembers: members.sort(
                    (a, b) => b.weeklyScore - a.weeklyScore,
                  ),
                },
              });
            } catch (groupError) {
              console.error(
                "Failed to load group data during init",
                groupError,
              );
            }
          };

          try {
            // Attempt to load the user's DB profile
            const profile = await databases.getDocument(
              APPWRITE_DB_ID,
              APPWRITE_USERS_COLLECTION_ID,
              currentAccount.$id,
            );

            const user: User = {
              id: currentAccount.$id,
              name: currentAccount.name,
              email: currentAccount.email,
              avatarInitials: currentAccount.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              streak: profile.streak || 0,
              totalScore: profile.totalScore || 0,
              weeklyScore: profile.weeklyScore || 0,
              lastWeeklyReset: profile.lastWeeklyReset || null,
              lastWorkoutDate: profile.lastWorkoutDate
                ? profile.lastWorkoutDate.split("T")[0]
                : null,
              groupId: profile.groupId || null,
              createdAt: currentAccount.$createdAt,
              memorizationTotal: profile.memorizationTotal || 0,
              contextTotal: profile.contextTotal || 0,
              verseMatchTotal: profile.verseMatchTotal || 0,
              rearrangeTotal: profile.rearrangeTotal || 0,
              masteryTotal: profile.masteryTotal || 0,
              masteryConsistency: profile.masteryConsistency || 0,
              masteredCount: profile.masteredCount || 0,
            };

            // Check if we need to reset the weekly score
            if (
              !user.lastWeeklyReset ||
              new Date(user.lastWeeklyReset) < currentStartOfWeek
            ) {
              user.weeklyScore = 0;
              user.lastWeeklyReset = new Date().toISOString();

              // Sync reset to Appwrite
              databases
                .updateDocument(
                  APPWRITE_DB_ID,
                  APPWRITE_USERS_COLLECTION_ID,
                  user.id,
                  {
                    weeklyScore: 0,
                    lastWeeklyReset: user.lastWeeklyReset,
                  },
                )
                .catch((e) => console.error("Failed to sync weekly reset", e));
            }

            dispatch({ type: "INITIALIZE_APPWRITE_USER", payload: user });

            // Fetch group data if the user belongs to one
            if (user.groupId) {
              await fetchAndDispatchGroupData(user.groupId);
            }
            dispatch({ type: "SET_LOADING", payload: false });
          } catch (e: any) {
            // ... (catch block continue)
            // If profile doesn't exist, create one
            if (e.code === 404) {
              const newUser: User = {
                id: currentAccount.$id,
                name: currentAccount.name,
                email: currentAccount.email,
                avatarInitials: currentAccount.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2),
                streak: 0,
                totalScore: 0,
                weeklyScore: 0,
                lastWeeklyReset: new Date().toISOString(),
                lastWorkoutDate: null,
                groupId: null,
                createdAt: currentAccount.$createdAt,
              };

              try {
                await databases.createDocument(
                  APPWRITE_DB_ID,
                  APPWRITE_USERS_COLLECTION_ID,
                  currentAccount.$id,
                  {
                    name: newUser.name,
                    email: newUser.email,
                    streak: newUser.streak,
                    totalScore: newUser.totalScore,
                    weeklyScore: newUser.weeklyScore,
                    lastWeeklyReset: newUser.lastWeeklyReset,
                    lastWorkoutDate: newUser.lastWorkoutDate,
                  },
                );
                dispatch({
                  type: "INITIALIZE_APPWRITE_USER",
                  payload: newUser,
                });

                // Fetch group data if the new user belongs to one (unlikely on creation, but for consistency)
                if (newUser.groupId) {
                  await fetchAndDispatchGroupData(newUser.groupId);
                }
                dispatch({ type: "SET_LOADING", payload: false });
              } catch (createError) {
                console.error(
                  "Failed to create new user document in Appwrite",
                  createError,
                );
                dispatch({ type: "SET_LOADING", payload: false });
              }
            } else {
              console.error("Error fetching user profile", e);
              dispatch({ type: "SET_LOADING", payload: false });
            }
          }
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        // No valid Appwrite session (e.g., AppwriteException: User (role: guests) missing scope)
        console.log("No active Appwrite session found.", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initApp();
  }, []);

  // Persist to localStorage on state changes
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(
        "bible-gym-state",
        JSON.stringify({
          user: state.user,
          groups: state.groups,
          groupMembers: state.groupMembers,
          workout: state.workout,
          currentDrillIndex: state.currentDrillIndex,
          practiceDrillType: state.practiceDrillType,
          practiceConfig: state.practiceConfig,
          verseMastery: state.verseMastery,
          masteryStats: state.masteryStats,
          returnView: state.returnView,
        }),
      );
    }
  }, [
    state.user,
    state.groups,
    state.groupMembers,
    state.workout,
    state.currentDrillIndex,
    state.verseMastery,
    state.masteryStats,
    state.isLoading,
    state.returnView,
  ]);

  return React.createElement(
    AppStateContext.Provider,
    { value: state },
    React.createElement(
      AppDispatchContext.Provider,
      { value: dispatch },
      children,
    ),
  );
}
