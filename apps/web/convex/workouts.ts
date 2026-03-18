import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveWorkout = mutation({
  args: {
    date: v.string(),
    totalScore: v.number(),
    memorizationScore: v.number(),
    contextScore: v.number(),
    verseMatchScore: v.number(),
    rearrangeScore: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("workouts", {
      userId,
      ...args,
    });
  },
});

export const getMyWorkouts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
