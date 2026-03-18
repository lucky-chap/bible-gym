import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const upsertMastery = mutation({
  args: {
    referenceId: v.string(),
    passageReference: v.string(),
    passageText: v.string(),
    currentLevel: v.number(),
    bestAccuracy: v.number(),
    bestTime: v.number(),
    status: v.string(),
    lastPracticed: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("mastery")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("referenceId"), args.referenceId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("mastery", {
        userId,
        ...args,
      });
    }
  },
});

export const getMyMastery = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("mastery")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
