import { AppState, Action, initialState } from "./types";
import { User, VerseMastery, MasteryLevel } from "../types";
import {
  databases,
  APPWRITE_DB_ID,
  APPWRITE_USERS_COLLECTION_ID,
  APPWRITE_WORKOUTS_COLLECTION_ID,
  APPWRITE_GROUPS_COLLECTION_ID,
  APPWRITE_MASTERY_COLLECTION_ID,
} from "../appwrite";
import { ID } from "appwrite";

export function appReducer(state: AppState, action: Action): AppState {
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
