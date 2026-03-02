"use client";

import { useAppState, useAppDispatch } from "@/lib/store/context";
import { Group, GroupMember, Workout } from "../../types";
import {
  databases,
  APPWRITE_DB_ID,
  APPWRITE_GROUPS_COLLECTION_ID,
  APPWRITE_USERS_COLLECTION_ID,
} from "../../appwrite";
import { Query, ID } from "appwrite";
import { parseGroupDoc, generateInviteCode } from "../utils";

export function useGroups() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const refreshGroupData = async (groupId: string) => {
    try {
      // 1. Fetch group details
      let groupDoc;
      try {
        groupDoc = await databases.getDocument(
          APPWRITE_DB_ID,
          APPWRITE_GROUPS_COLLECTION_ID,
          groupId,
        );
      } catch (e: any) {
        if (e.code === 404 || e.message?.toLowerCase().includes("not found")) {
          console.warn("Group not found, clearing state");
          dispatch({ type: "SET_GROUPS", payload: [] });
          dispatch({ type: "SET_GROUP_MEMBERS", payload: [] });

          if (state.user?.id) {
            try {
              const userDoc = await databases.getDocument(
                APPWRITE_DB_ID,
                APPWRITE_USERS_COLLECTION_ID,
                state.user.id,
              );
              if (userDoc.groupId === null) {
                dispatch({
                  type: "SET_USER",
                  payload: { ...state.user, groupId: null },
                });
              }
            } catch (userErr) {
              console.error("Error verifying user groupId:", userErr);
            }
          }
          return false;
        }
        throw e;
      }

      dispatch({ type: "SET_GROUPS", payload: [parseGroupDoc(groupDoc)] });

      // 2. Fetch all members (both active and those who have left)
      const allMemberIds = [
        ...(groupDoc.members || []),
        ...(groupDoc.leftMembers || []),
      ];

      if (allMemberIds.length === 0) {
        dispatch({ type: "SET_GROUP_MEMBERS", payload: [] });
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
        type: "SET_GROUP_MEMBERS",
        payload: members.sort((a, b) => b.weeklyScore - a.weeklyScore),
      });
    } catch (e) {
      console.error("Failed to refresh group data:", e);
    }
  };

  const createGroup = async (name: string): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const groupId = ID.unique();
      const group: Group = {
        id: groupId,
        name,
        inviteCode: generateInviteCode(),
        members: [state.user.id],
        createdBy: state.user.id,
        createdAt: new Date().toISOString(),
        groupChallenge: null,
        challengeParticipants: [],
      };

      await databases.createDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        groupId,
        {
          name: group.name,
          inviteCode: group.inviteCode,
          members: group.members,
          createdBy: group.createdBy,
          createdAt: group.createdAt,
          groupChallenge: null,
          challengeParticipants: [],
        },
      );

      await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_USERS_COLLECTION_ID,
        state.user.id,
        { groupId: groupId },
      );

      dispatch({ type: "JOIN_GROUP", payload: group });
      await refreshGroupData(groupId);
      return true;
    } catch (e) {
      console.error("Failed to create group:", e);
      return false;
    }
  };

  const joinGroup = async (inviteCode: string) => {
    if (!state.user) return false;

    try {
      const response = await databases.listDocuments(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        [Query.equal("inviteCode", inviteCode)],
      );

      if (response.documents.length === 0) return false;

      const groupDoc = response.documents[0];
      const groupId = groupDoc.$id;
      const currentMembers = groupDoc.members || [];

      if (!currentMembers.includes(state.user.id)) {
        await databases.updateDocument(
          APPWRITE_DB_ID,
          APPWRITE_GROUPS_COLLECTION_ID,
          groupId,
          {
            members: [...currentMembers, state.user.id],
          },
        );
      }

      await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_USERS_COLLECTION_ID,
        state.user.id,
        { groupId: groupId },
      );

      dispatch({ type: "JOIN_GROUP", payload: parseGroupDoc(groupDoc) });
      await refreshGroupData(groupId);
      return true;
    } catch (e) {
      console.error("Failed to join group:", e);
      return false;
    }
  };

  const setGroupChallenge = async (challenge: Workout) => {
    if (!state.user?.groupId) return;

    try {
      await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        state.user.groupId,
        {
          groupChallenge: JSON.stringify(challenge),
          challengeParticipants: [],
        },
      );
      dispatch({ type: "SET_GROUP_CHALLENGE", payload: challenge });
    } catch (e) {
      console.error("Failed to set group challenge:", e);
    }
  };

  const deleteGroupChallenge = async () => {
    if (!state.user?.groupId) return;

    try {
      await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        state.user.groupId,
        {
          groupChallenge: null,
          challengeParticipants: [],
        },
      );
      dispatch({ type: "DELETE_GROUP_CHALLENGE" });
    } catch (e) {
      console.error("Failed to delete group challenge:", e);
    }
  };

  const leaveGroup = async () => {
    if (!state.user?.groupId) return false;
    const groupId = state.user.groupId;
    const userId = state.user.id;

    try {
      const groupDoc = await databases.getDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        groupId,
      );

      if (groupDoc.createdBy === userId) {
        console.error("Creator cannot leave the group. Use delete instead.");
        return false;
      }

      const currentMembers = (groupDoc.members || []) as string[];
      const currentLeftMembers = (groupDoc.leftMembers || []) as string[];

      await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        groupId,
        {
          members: currentMembers.filter((id) => id !== userId),
          leftMembers: Array.from(new Set([...currentLeftMembers, userId])),
        },
      );

      await databases.updateDocument(
        APPWRITE_DB_ID,
        APPWRITE_USERS_COLLECTION_ID,
        userId,
        { groupId: null },
      );

      dispatch({
        type: "SET_USER",
        payload: { ...state.user, groupId: null },
      });
      dispatch({ type: "SET_GROUPS", payload: [] });
      dispatch({ type: "SET_GROUP_MEMBERS", payload: [] });

      return true;
    } catch (e) {
      console.error("Failed to leave group:", e);
      return false;
    }
  };

  const deleteGroup = async () => {
    if (!state.user?.groupId) return false;
    const groupId = state.user.groupId;
    const userId = state.user.id;

    try {
      const groupDoc = await databases.getDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        groupId,
      );

      if (groupDoc.createdBy !== userId) {
        console.error("Only the creator can delete the group");
        return false;
      }

      const allMemberIds = Array.from(
        new Set([...(groupDoc.members || []), ...(groupDoc.leftMembers || [])]),
      );

      await Promise.all(
        allMemberIds.map((id) =>
          databases
            .updateDocument(APPWRITE_DB_ID, APPWRITE_USERS_COLLECTION_ID, id, {
              groupId: null,
            })
            .catch((err) => {
              console.error(`Error clearing groupId for user ${id}:`, err);
            }),
        ),
      );

      await databases.deleteDocument(
        APPWRITE_DB_ID,
        APPWRITE_GROUPS_COLLECTION_ID,
        groupId,
      );

      dispatch({
        type: "SET_USER",
        payload: { ...state.user, groupId: null },
      });
      dispatch({ type: "SET_GROUPS", payload: [] });
      dispatch({ type: "SET_GROUP_MEMBERS", payload: [] });

      return true;
    } catch (e) {
      console.error("Failed to delete group:", e);
      return false;
    }
  };

  return {
    groupMembers: state.groupMembers,
    userGroup: state.groups.find((g: Group) => g.id === state.user?.groupId),
    createGroup,
    joinGroup,
    setGroupChallenge,
    deleteGroupChallenge,
    refreshGroupData,
    leaveGroup,
    deleteGroup,
  };
}
