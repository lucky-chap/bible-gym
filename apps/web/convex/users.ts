import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    streak: v.optional(v.number()),
    totalScore: v.optional(v.number()),
    weeklyScore: v.optional(v.number()),
    lastWeeklyReset: v.optional(v.string()),
    lastWorkoutDate: v.optional(v.string()),
    groupId: v.optional(v.string()),
    memorizationTotal: v.optional(v.number()),
    contextTotal: v.optional(v.number()),
    verseMatchTotal: v.optional(v.number()),
    rearrangeTotal: v.optional(v.number()),
    masteryTotal: v.optional(v.number()),
    masteryConsistency: v.optional(v.number()),
    masteredCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, args);
  },
});
