"use client";

import { useRouter } from "next/navigation";
import { useAppState, useAppDispatch } from "@/lib/store/context";
import { BiblePassage, VerseMastery, MasteryLevel } from "../../types";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useMastery() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const upsertMasteryMutation = useMutation(api.mastery.upsertMastery);

  const startMastery = async (verse: BiblePassage) => {
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

      // Persist to Convex
      upsertMasteryMutation({
        referenceId: verse.reference,
        passageReference: JSON.stringify(verse),
        passageText: verse.text,
        currentLevel: 1,
        bestAccuracy: 0,
        bestTime: 0,
        status: "learning",
        lastPracticed: new Date().toISOString(),
      }).catch((e) =>
        console.error("Failed to initialize mastery in Convex:", e),
      );

      dispatch({
        type: "UPDATE_VERSE_MASTERY",
        payload: { id: verse.reference, mastery: initialMastery },
      });
    }
    dispatch({ type: "SET_VIEW", payload: "practice" });
    router.push(`/mastery/${encodeURIComponent(verse.reference)}`);
  };

  const completeLevel = (
    id: string, // reference
    level: MasteryLevel,
    accuracy: number,
    time: number,
  ) => {
    const existing = state.verseMastery[id];
    if (existing) {
      // Persist to Convex
      upsertMasteryMutation({
        passageText: existing.passage.text,
        referenceId: id,
        passageReference: JSON.stringify(existing.passage),
        currentLevel: level + 1, // Advance to next level?
        // Actually the logic for level advancement is usually in the reducer,
        // but I should sync the new state.
        bestAccuracy: Math.max(existing.bestAccuracy || 0, accuracy),
        bestTime: existing.bestTime ? Math.min(existing.bestTime, time) : time,
        status: level >= 3 ? "mastered" : "learning",
        lastPracticed: new Date().toISOString(),
      }).catch((e) => console.error("Failed to update mastery in Convex:", e));
    }

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
