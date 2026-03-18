import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const createGroup = mutation({
  args: {
    name: v.string(),
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      inviteCode: args.inviteCode,
      members: [userId],
      createdBy: userId,
      createdAt: new Date().toISOString(),
      challengeParticipants: [],
      leftMembers: [],
    });

    await ctx.db.patch(userId, { groupId: groupId as string });
    return groupId;
  },
});

export const getGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.groupId);
  },
});

export const getGroupByInvite = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groups")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();
  },
});

export const joinGroup = mutation({
  // Renamed to joinGroup to match the hook's useMutation(api.groups.joinGroup)
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const group = await ctx.db
      .query("groups")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", args.inviteCode))
      .unique();

    if (!group) throw new Error("Group not found");

    if (!group.members.includes(userId)) {
      await ctx.db.patch(group._id, {
        members: [...group.members, userId],
      });
    }

    await ctx.db.patch(userId, { groupId: group._id as string });
    return group._id;
  },
});

export const leaveGroup = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !user.groupId) return;

    const group = await ctx.db.get(user.groupId as Id<"groups">);
    if (!group) return;

    if (group.createdBy === userId) {
      throw new Error("Creator cannot leave the group");
    }

    await ctx.db.patch(group._id, {
      members: group.members.filter((id: string) => id !== userId),
      leftMembers: Array.from(new Set([...group.leftMembers, userId])),
    });

    await ctx.db.patch(userId, { groupId: undefined });
  },
});
