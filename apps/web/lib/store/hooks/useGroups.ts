"use client";

import { useAppState, useAppDispatch } from "@/lib/store/context";
import { Group, GroupMember, Workout } from "../../types";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { generateInviteCode } from "../utils";

export function useGroups() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const createGroupMutation = useMutation(api.groups.createGroup);
  const joinGroupMutation = useMutation(api.groups.joinGroup);
  // Add other mutations if needed

  const refreshGroupData = async (groupId: string) => {
    // In Convex, this is mostly handled by useQuery in the provider or components.
    // But for compatibility with existing code that expects this to be a manual refresh:
    console.log("refreshGroupData called for", groupId);
  };

  const createGroup = async (name: string): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const inviteCode = generateInviteCode();
      const groupId = await createGroupMutation({
        name,
        inviteCode,
      });

      if (groupId) {
        dispatch({
          type: "JOIN_GROUP",
          payload: {
            id: groupId,
            name,
            inviteCode,
            members: [state.user.id],
            createdBy: state.user.id,
            createdAt: new Date().toISOString(),
            groupChallenge: null,
            challengeParticipants: [],
          },
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to create group:", e);
      return false;
    }
  };

  const joinGroup = async (inviteCode: string) => {
    if (!state.user) return false;

    try {
      await joinGroupMutation({ inviteCode });
      return true;
    } catch (e) {
      console.error("Failed to join group:", e);
      return false;
    }
  };

  const setGroupChallenge = async (challenge: Workout) => {
    // TODO: Implement setGroupChallenge mutation
    console.warn("setGroupChallenge not implemented for Convex yet");
  };

  const deleteGroupChallenge = async () => {
    // TODO: Implement deleteGroupChallenge mutation
    console.warn("deleteGroupChallenge not implemented for Convex yet");
  };

  const leaveGroup = async () => {
    // TODO: Implement leaveGroup mutation
    console.warn("leaveGroup not implemented for Convex yet");
    return false;
  };

  const deleteGroup = async () => {
    // TODO: Implement deleteGroup mutation
    console.warn("deleteGroup not implemented for Convex yet");
    return false;
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
