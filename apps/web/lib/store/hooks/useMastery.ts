"use client";

import { useRouter } from "next/navigation";
import { useAppState, useAppDispatch } from "@/lib/store/context";
import { BiblePassage, VerseMastery, MasteryLevel } from "../../types";

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
    dispatch({ type: "SET_VIEW", payload: "practice" });
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
