import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getDailyWorkout = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyWorkouts")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .unique();
  },
});

export const saveDailyWorkout = mutation({
  args: {
    date: v.string(),
    workoutData: v.string(),
    isAiGenerated: v.boolean(),
    theme: v.optional(v.string()),
    isBackup: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyWorkouts")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("dailyWorkouts", args);
    }
  },
});
