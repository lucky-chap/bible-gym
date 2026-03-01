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
  APPWRITE_PRACTICE_COLLECTION_ID
} from "./appwrite";
import { OAuthProvider, ID } from "appwrite";

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
  | { type: "START_PRACTICE"; payload: { type: "memorization" | "context" | "verse-match" | "rearrange" | "ai-themed", config?: PracticeConfig } }
  | { type: "SET_GROUP_CHALLENGE"; payload: Workout }
  | { type: "DELETE_GROUP_CHALLENGE" }
  | {
    type: "UPDATE_VERSE_MASTERY";
    payload: { id: string; mastery: VerseMastery };
  }
  | {
    type: "COMPLETE_MASTERY_LEVEL";
    payload: { id: string; level: MasteryLevel; accuracy: number; time: number };
  }
  | {
    type: "LOG_PRACTICE_SCORE";
    payload: { drillType: string; score: number; accuracy: number; config: PracticeConfig | null };
  }
  | { type: "LOAD_STATE"; payload: Partial<AppState> }
  | { type: "INITIALIZE_APPWRITE_USER"; payload: User };

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
        currentView: state.currentView === "landing" ? "dashboard" : state.currentView
      };

    case "LOGOUT":
      return { ...initialState, isLoading: false, currentView: "landing" };

    case "SET_VIEW":
      return { ...state, currentView: action.payload };

    case "START_WORKOUT":
      return {
        ...state,
        workout: action.payload,
        currentDrillIndex: 0,
        currentView: "workout",
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
          totalScore: scores.memorization + scores.context + scores.verseMatch + (scores.rearrange || 0),
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

      const updatedUser: User = {
        ...state.user,
        streak: newStreak,
        totalScore: state.user.totalScore + state.workout.totalScore,
        lastWorkoutDate: today,
      };

      // Sync user data to Appwrite
      if (updatedUser) {
        databases.updateDocument(
          APPWRITE_DB_ID,
          APPWRITE_USERS_COLLECTION_ID,
          updatedUser.id,
          {
            streak: updatedUser.streak,
            totalScore: updatedUser.totalScore,
            lastWorkoutDate: updatedUser.lastWorkoutDate,
          }
        ).catch(e => console.error("Failed to sync user data to Appwrite", e));

        // Create a record of this daily workout
        databases.createDocument(
          APPWRITE_DB_ID,
          APPWRITE_WORKOUTS_COLLECTION_ID,
          ID.unique(),
          {
            userId: updatedUser.id,
            date: today,
            totalScore: state.workout.totalScore,
            memorizationScore: state.workout.scores.memorization,
            contextScore: state.workout.scores.context,
            verseMatchScore: state.workout.scores.verseMatch,
            rearrangeScore: state.workout.scores.rearrange,
          }
        ).catch(e => console.error("Failed to log daily workout", e));
      }

      const updatedGroupMembers = state.groupMembers
        .map((m) =>
          m.userId === updatedUser.id
            ? {
                ...m,
                weeklyScore: m.weeklyScore + state.workout!.totalScore,
                streak: updatedUser.streak,
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
      };

    case "LOG_PRACTICE_SCORE": {
      if (state.user) {
        databases.createDocument(
            APPWRITE_DB_ID,
            APPWRITE_PRACTICE_COLLECTION_ID,
            ID.unique(),
            {
               userId: state.user.id,
               timestamp: new Date().toISOString(),
               drillType: action.payload.drillType,
               score: action.payload.score,
               accuracy: action.payload.accuracy,
               config: action.payload.config ? JSON.stringify(action.payload.config) : null
            }
        ).catch(e => console.error("Failed to sync practice history to Appwrite", e));
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
          databases.getDocument(
             APPWRITE_DB_ID,
             APPWRITE_MASTERY_COLLECTION_ID,
             `${state.user!.id}_${id}`
          ).then(() => {
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
                }
              );
          }).catch((e) => {
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
                 }
               );
            }
            console.error("Failed to sync mastery to Appwrite", e);
        });
      }

      return {
        ...state,
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
        `${window.location.origin}/`
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
    const workout = generateDailyWorkout(state.user?.id);
    if (aiDrill) {
      // Replace one random drill with the AI one
      const randomIndex = Math.floor(Math.random() * 3);
      workout.drills[randomIndex] = aiDrill;
    }
    dispatch({ type: "START_WORKOUT", payload: workout });
    router.push("/workout");
  };

  const startGroupChallenge = (challenge: Workout) => {
    dispatch({ type: "START_WORKOUT", payload: challenge });
    router.push("/workout");
  };

  const completeDrill = (drillType: string, score: number) => {
    dispatch({ type: "COMPLETE_DRILL", payload: { drillType, score } });
  };

  const nextDrill = () => {
    if (state.workout && state.currentDrillIndex < state.workout.drills.length - 1) {
      dispatch({ type: "NEXT_DRILL" });
    } else {
      dispatch({ type: "COMPLETE_WORKOUT" });
      router.push("/workout-complete");
    }
  };

  return {
    workout: state.workout,
    currentDrillIndex: state.currentDrillIndex,
    startWorkout,
    startGroupChallenge,
    completeDrill,
    nextDrill,
  };
}

export function usePractice() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const startPractice = (type: "memorization" | "context" | "verse-match" | "rearrange" | "ai-themed", config?: PracticeConfig) => {
    dispatch({ type: "START_PRACTICE", payload: { type, config } });
    router.push("/practice");
  };

  const exitPractice = () => {
    router.push("/dashboard");
  };

  const logPractice = (score: number, accuracy: number = score) => {
    if (!state.practiceDrillType) return;
    dispatch({ 
      type: "LOG_PRACTICE_SCORE", 
      payload: { 
        drillType: state.practiceDrillType, 
        score, 
        accuracy, 
        config: state.practiceConfig 
      } 
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

  const createGroup = (name: string) => {
    if (!state.user) return;

    const group: Group = {
      id: `group-${Date.now()}`,
      name,
      inviteCode: generateInviteCode(),
      members: [state.user.id],
      createdBy: state.user.id,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: "JOIN_GROUP", payload: group });

    // Generate mock leaderboard
    generateMockLeaderboard(dispatch, state.user, group);
  };

  const joinGroup = (inviteCode: string) => {
    // For MVP, create a mock group for demo purposes
    if (!state.user) return false;

    const existingGroup = state.groups.find((g) => g.inviteCode === inviteCode);
    if (existingGroup) {
      dispatch({ type: "JOIN_GROUP", payload: existingGroup });
      return true;
    }

    // Create demo group
    const group: Group = {
      id: `group-${Date.now()}`,
      name: "Bible Warriors",
      inviteCode,
      members: [state.user.id],
      createdBy: "demo",
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: "JOIN_GROUP", payload: group });
    generateMockLeaderboard(dispatch, state.user, group);
    return true;
  };

  const setGroupChallenge = (challenge: Workout) => {
    dispatch({ type: "SET_GROUP_CHALLENGE", payload: challenge });
  };

  const deleteGroupChallenge = () => {
    dispatch({ type: "DELETE_GROUP_CHALLENGE" });
  };

  return {
    groupMembers: state.groupMembers,
    userGroup: state.groups.find((g) => g.id === state.user?.groupId),
    createGroup,
    joinGroup,
    setGroupChallenge,
    deleteGroupChallenge,
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
  const mockNames = ["Sarah K.", "David M.", "Ruth O.", "James L.", "Esther A."];

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
            } as Partial<AppState>,
          });
        }

        // 2. Check Appwrite for active session (source of truth)
        const currentAccount = await account.get();
        if (currentAccount) {
          try {
            // Attempt to load the user's DB profile
            const profile = await databases.getDocument(
              APPWRITE_DB_ID,
              APPWRITE_USERS_COLLECTION_ID,
              currentAccount.$id
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
              lastWorkoutDate: profile.lastWorkoutDate || null,
              groupId: profile.groupId || null,
              createdAt: currentAccount.$createdAt,
            };
            dispatch({ type: "INITIALIZE_APPWRITE_USER", payload: user });

          } catch (e: any) {
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
                        lastWorkoutDate: newUser.lastWorkoutDate,
                        groupId: newUser.groupId
                    }
                );
                dispatch({ type: "INITIALIZE_APPWRITE_USER", payload: newUser });
              } catch (createError) {
                console.error("Failed to create new user document in Appwrite", createError);
                dispatch({ type: "SET_LOADING", payload: false });
              }
            } else {
              console.error("Error fetching user profile", e);
              dispatch({ type: "SET_LOADING", payload: false });
            }
          }

          // Optional: Load mastery data from Appwrite here if needed, 
          // or rely on local storage for now until explicitly synced.
          // For a full implementation, you'd fetch the mastery collection using `Query.equal('userId', currentAccount.$id)`
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
  ]);

  return React.createElement(
    AppStateContext.Provider,
    { value: state },
    React.createElement(
      AppDispatchContext.Provider,
      { value: dispatch },
      children
    )
  );
}
