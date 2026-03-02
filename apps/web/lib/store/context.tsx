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
import {
  account,
  databases,
  APPWRITE_DB_ID,
  APPWRITE_USERS_COLLECTION_ID,
  APPWRITE_GROUPS_COLLECTION_ID,
} from "../appwrite";
import { User, GroupMember } from "../types";
import { parseGroupDoc } from "./utils";
import { Query } from "appwrite";

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

  useEffect(() => {
    const initApp = async () => {
      try {
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
            },
          });
        }

        const currentAccount = await account.get();
        if (currentAccount) {
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
              let groupDoc;
              try {
                groupDoc = await databases.getDocument(
                  APPWRITE_DB_ID,
                  APPWRITE_GROUPS_COLLECTION_ID,
                  groupId,
                );
              } catch (e: any) {
                if (
                  e.code === 404 ||
                  e.message?.toLowerCase().includes("not found")
                ) {
                  console.warn("Group not found during init app");
                  return;
                }
                throw e;
              }

              const parsedGroupDoc = parseGroupDoc(groupDoc);

              const allMemberIds = [
                ...(groupDoc.members || []),
                ...(groupDoc.leftMembers || []),
              ];

              if (allMemberIds.length === 0) {
                dispatch({
                  type: "LOAD_STATE",
                  payload: {
                    groups: [parsedGroupDoc],
                    groupMembers: [],
                  },
                });
                return;
              }

              const usersResponse = await databases.listDocuments(
                APPWRITE_DB_ID,
                APPWRITE_USERS_COLLECTION_ID,
                [Query.equal("$id", allMemberIds), Query.limit(100)],
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
                  hasLeft: groupDoc.leftMembers?.includes(doc.$id) || false,
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

            if (
              !user.lastWeeklyReset ||
              new Date(user.lastWeeklyReset) < currentStartOfWeek
            ) {
              user.weeklyScore = 0;
              user.lastWeeklyReset = new Date().toISOString();

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
                .catch((e) => console.error("Weekly reset sync failed", e));
            }

            dispatch({ type: "INITIALIZE_APPWRITE_USER", payload: user });

            if (user.groupId) {
              await fetchAndDispatchGroupData(user.groupId);
            }
            dispatch({ type: "SET_LOADING", payload: false });
          } catch (e: any) {
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
              } catch (createErr) {
                console.error("Failed to create profile", createErr);
              }
            } else {
              console.error("Failed to fetch session", e);
            }
            dispatch({ type: "SET_LOADING", payload: false });
          }
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Auth check failed", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initApp();
  }, []);

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
      localStorage.setItem("bible-gym-state", JSON.stringify(stateToSave));
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
