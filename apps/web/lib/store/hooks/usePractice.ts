"use client";

import { useRouter } from "next/navigation";
import { useAppState, useAppDispatch } from "@/lib/store/context";
import { User, PracticeConfig } from "../../types";
import {
  databases,
  APPWRITE_DB_ID,
  APPWRITE_USERS_COLLECTION_ID,
  APPWRITE_PRACTICE_COLLECTION_ID,
} from "../../appwrite";
import { ID } from "appwrite";

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
