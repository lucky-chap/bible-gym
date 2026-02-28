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
import { User, Group, GroupMember, Workout, AppView, PracticeConfig } from "./types";
import { generateDailyWorkout } from "./workout-generator";

// ── State Shape ─────────────────────────────────────────────

interface AppState {
  user: User | null;
  currentView: AppView;
  workout: Workout | null;
  currentDrillIndex: number;
  practiceDrillType: "memorization" | "context" | "verse-match" | "ai-themed" | null;
  practiceConfig: PracticeConfig | null;
  groups: Group[];
  groupMembers: GroupMember[];
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
  | { type: "START_PRACTICE"; payload: { type: "memorization" | "context" | "verse-match" | "ai-themed", config?: PracticeConfig } }
  | { type: "SET_GROUP_CHALLENGE"; payload: Workout }
  | { type: "DELETE_GROUP_CHALLENGE" }
  | { type: "LOAD_STATE"; payload: Partial<AppState> };

// ── Reducer ─────────────────────────────────────────────────

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

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

      return {
        ...state,
        workout: {
          ...state.workout,
          scores,
          totalScore: scores.memorization + scores.context + scores.verseMatch,
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

      const updatedGroupMembers = state.groupMembers.map((m) =>
        m.userId === updatedUser.id
          ? {
              ...m,
              weeklyScore: m.weeklyScore + state.workout!.totalScore,
              streak: updatedUser.streak,
            }
          : m
      ).sort((a, b) => b.weeklyScore - a.weeklyScore);

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
      return { ...state, currentView: "practice", practiceDrillType: action.payload.type, practiceConfig: action.payload.config || null };

    case "SET_GROUP_CHALLENGE": {
      if (!state.user?.groupId) return state;
      const updatedGroups = state.groups.map((g) =>
        g.id === state.user!.groupId
          ? { ...g, groupChallenge: action.payload, challengeParticipants: [] }
          : g
      );
      return { ...state, groups: updatedGroups };
    }

    case "DELETE_GROUP_CHALLENGE": {
      if (!state.user?.groupId) return state;
      const updatedGroups = state.groups.map((g) =>
        g.id === state.user!.groupId
          ? { ...g, groupChallenge: null, challengeParticipants: [] }
          : g
      );
      return { ...state, groups: updatedGroups };
    }

    case "LOAD_STATE":
      return { ...state, ...action.payload, isLoading: false };

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

  const login = (name: string, email: string) => {
    const user: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatarInitials: name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      streak: 0,
      totalScore: 0,
      lastWorkoutDate: null,
      groupId: null,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "SET_USER", payload: user });
    router.push("/dashboard");
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    if (typeof window !== "undefined") {
      localStorage.removeItem("bible-gym-state");
    }
  };

  return { user: state.user, login, logout, isAuthenticated: !!state.user };
}

export function useWorkout() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const startWorkout = async (aiDrill?: Workout["drills"][0]) => {
    const workout = generateDailyWorkout();
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
    if (state.workout && state.currentDrillIndex < 2) {
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

  const startPractice = (type: "memorization" | "context" | "verse-match" | "ai-themed", config?: PracticeConfig) => {
    dispatch({ type: "START_PRACTICE", payload: { type, config } });
    router.push("/practice");
  };

  const exitPractice = () => {
    router.push("/dashboard");
  };

  return {
    practiceDrillType: state.practiceDrillType,
    practiceConfig: state.practiceConfig,
    startPractice,
    exitPractice,
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

    const existingGroup = state.groups.find(
      (g) => g.inviteCode === inviteCode
    );
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
  _group: Group
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bible-gym-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({
          type: "LOAD_STATE",
          payload: {
            user: parsed.user,
            groups: parsed.groups || [],
            groupMembers: parsed.groupMembers || [],
            workout: parsed.workout || null,
            currentDrillIndex: parsed.currentDrillIndex || 0,
            practiceDrillType: parsed.practiceDrillType || null,
            practiceConfig: parsed.practiceConfig || null,
          } as Partial<AppState>,
        });
        
        // Let the layout check if we need to redirect due to auth status
        // But disable loading regardless
        dispatch({ type: "SET_LOADING", payload: false });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch {
      dispatch({ type: "SET_LOADING", payload: false });
    }
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
        })
      );
    }
  }, [
    state.user,
    state.groups,
    state.groupMembers,
    state.workout,
    state.currentDrillIndex,
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
