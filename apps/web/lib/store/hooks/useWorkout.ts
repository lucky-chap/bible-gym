"use client";

import { useRouter } from "next/navigation";
import { useAppState, useAppDispatch } from "@/lib/store/context";
import { Workout } from "../types";
import { generateDailyWorkout } from "../../workout-generator";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useWorkout() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const startWorkout = async (aiDrill?: Workout["drills"][0]) => {
    try {
      const response = await fetch("/api/daily-workout");
      if (!response.ok) throw new Error("Failed to fetch daily workout");
      const workout = await response.json();

      if (aiDrill) {
        const randomIndex = Math.floor(Math.random() * 3);
        workout.drills[randomIndex] = aiDrill;
      }

      dispatch({ type: "START_WORKOUT", payload: workout });
      router.push("/workout");
    } catch (error) {
      console.error("Failed to start daily workout:", error);
      const fallback = await generateDailyWorkout(state.user?.id);
      dispatch({ type: "START_WORKOUT", payload: fallback });
      router.push("/workout");
    }
  };

  const startGroupChallenge = (challenge: Workout) => {
    dispatch({ type: "START_WORKOUT", payload: challenge });
    router.push("/workout");
  };

  const saveWorkoutMutation = useMutation(api.workouts.saveWorkout);
  const updateProfileMutation = useMutation(api.users.updateProfile);

  const handleDrillComplete = async (drillType: string, score: number) => {
    dispatch({ type: "COMPLETE_DRILL", payload: { drillType, score } });

    if (
      state.workout &&
      state.currentDrillIndex < state.workout.drills.length - 1
    ) {
      dispatch({ type: "NEXT_DRILL" });
    } else {
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

        const totalScore = (state.user.totalScore || 0) + finalWorkoutTotal;
        const weeklyScore = state.workout.isGroupChallenge
          ? (state.user.weeklyScore || 0) + finalWorkoutTotal
          : state.user.weeklyScore;

        try {
          // Sync to Convex
          await updateProfileMutation({
            streak: newStreak,
            totalScore,
            weeklyScore,
            lastWorkoutDate: today,
          });

          await saveWorkoutMutation({
            date: today,
            totalScore: finalWorkoutTotal,
            memorizationScore: updatedScores.memorization,
            contextScore: updatedScores.context,
            verseMatchScore: updatedScores.verseMatch,
            rearrangeScore: updatedScores.rearrange || 0,
          });
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
