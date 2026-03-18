"use client";

import { useRouter } from "next/navigation";
import { useAppState, useAppDispatch } from "@/lib/store/context";
import { User, PracticeConfig } from "../../types";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

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

  const logPracticeMutation = useMutation(api.practice.logPractice);
  const updateProfileMutation = useMutation(api.users.updateProfile);

  const logPractice = async (score: number, accuracy: number = score) => {
    if (!state.practiceDrillType || !state.user) return;

    // Log practice history to Convex
    logPracticeMutation({
      timestamp: new Date().toISOString(),
      drillType: state.practiceDrillType,
      score,
      accuracy,
      config: state.practiceConfig
        ? JSON.stringify(state.practiceConfig)
        : undefined,
    }).catch((e) => console.error("Failed to log practice history:", e));

    const updatedStats: any = {
      totalScore: (state.user.totalScore || 0) + score,
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

    // Update user profile in Convex
    updateProfileMutation(updatedStats).catch((e) =>
      console.error("Failed to update user score:", e),
    );

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
