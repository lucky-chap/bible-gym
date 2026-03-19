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
import { AppState, Action, initialState } from "./types";
import { appReducer } from "./reducer";
import { User } from "../types";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth, useUser } from "@clerk/nextjs";

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<Action>>(() => {});

export function useAppState() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user: clerkUser } = useUser();

  const convexUser = useQuery(api.users.getMe);
  const updateUser = useMutation(api.users.updateProfile);

  // Initial local state load
  useEffect(() => {
    const saved = localStorage.getItem("word-mastery-state");
    if (saved) {
      try {
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
          },
        });
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  // Sync Clerk/Convex user to App State
  useEffect(() => {
    if (isSignedIn && isAuthLoaded && clerkUser) {
      // Prioritize Convex user if available, otherwise use Clerk info
      const user: User = {
        id: (convexUser?._id as string) || clerkUser.id,
        name: convexUser?.name || clerkUser.fullName || "User",
        email:
          convexUser?.email ||
          clerkUser.primaryEmailAddress?.emailAddress ||
          "",
        avatarInitials: (convexUser?.name || clerkUser.fullName || "U")
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        streak: convexUser?.streak || 0,
        totalScore: convexUser?.totalScore || 0,
        weeklyScore: convexUser?.weeklyScore || 0,
        lastWeeklyReset: convexUser?.lastWeeklyReset || null,
        lastWorkoutDate: convexUser?.lastWorkoutDate || null,
        groupId: convexUser?.groupId || null,
        createdAt: convexUser
          ? new Date(convexUser._creationTime).toISOString()
          : new Date().toISOString(),
        memorizationTotal: convexUser?.memorizationTotal || 0,
        contextTotal: convexUser?.contextTotal || 0,
        verseMatchTotal: convexUser?.verseMatchTotal || 0,
        rearrangeTotal: convexUser?.rearrangeTotal || 0,
        masteryTotal: convexUser?.masteryTotal || 0,
        masteryConsistency: convexUser?.masteryConsistency || 0,
        masteredCount: convexUser?.masteredCount || 0,
      };

      dispatch({ type: "INITIALIZE_USER", payload: user });
      dispatch({ type: "SET_LOADING", payload: false });
    } else if (isAuthLoaded && !isSignedIn) {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [isSignedIn, isAuthLoaded, clerkUser, convexUser]);

  // Persist state to local storage
  useEffect(() => {
    if (state.user && !state.isLoading) {
      const stateToSave = {
        groups: state.groups,
        groupMembers: state.groupMembers,
        workout: state.workout,
        currentDrillIndex: state.currentDrillIndex,
        practiceDrillType: state.practiceDrillType,
        practiceConfig: state.practiceConfig,
        verseMastery: state.verseMastery,
        masteryStats: state.masteryStats,
        returnView: state.returnView,
      };
      localStorage.setItem("word-mastery-state", JSON.stringify(stateToSave));
    }
  }, [
    state.user,
    state.isLoading,
    state.groups,
    state.groupMembers,
    state.workout,
    state.currentDrillIndex,
    state.practiceDrillType,
    state.practiceConfig,
    state.verseMastery,
    state.masteryStats,
    state.returnView,
  ]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}
