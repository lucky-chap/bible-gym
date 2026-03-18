import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    streak: v.optional(v.number()),
    totalScore: v.optional(v.number()),
    weeklyScore: v.optional(v.number()),
    lastWeeklyReset: v.optional(v.string()),
    lastWorkoutDate: v.optional(v.string()),
    groupId: v.optional(v.string()),
    // Elite Drill Progress Stats
    memorizationTotal: v.optional(v.number()),
    contextTotal: v.optional(v.number()),
    verseMatchTotal: v.optional(v.number()),
    rearrangeTotal: v.optional(v.number()),
    masteryTotal: v.optional(v.number()),
    // Mastery global stats
    masteryConsistency: v.optional(v.number()),
    masteredCount: v.optional(v.number()),
  }).index("by_email", ["email"]),

  workouts: defineTable({
    userId: v.id("users"),
    date: v.string(),
    totalScore: v.number(),
    memorizationScore: v.number(),
    contextScore: v.number(),
    verseMatchScore: v.number(),
    rearrangeScore: v.number(),
  }).index("by_user", ["userId"]),

  practiceHistory: defineTable({
    userId: v.id("users"),
    timestamp: v.string(),
    drillType: v.string(),
    score: v.number(),
    accuracy: v.number(),
    config: v.optional(v.string()), // JSON string
  }).index("by_user", ["userId"]),

  mastery: defineTable({
    userId: v.id("users"),
    referenceId: v.string(),
    passageReference: v.string(),
    passageText: v.string(),
    currentLevel: v.number(),
    bestAccuracy: v.number(),
    bestTime: v.number(),
    status: v.string(),
    lastPracticed: v.string(),
  }).index("by_user", ["userId"]),

  groups: defineTable({
    name: v.string(),
    inviteCode: v.string(),
    members: v.array(v.id("users")),
    createdBy: v.id("users"),
    createdAt: v.string(),
    groupChallenge: v.optional(v.string()), // JSON string
    challengeParticipants: v.array(v.id("users")),
    leftMembers: v.array(v.id("users")),
  }).index("by_inviteCode", ["inviteCode"]),

  dailyWorkouts: defineTable({
    date: v.string(),
    workoutData: v.string(), // JSON blob
    isAiGenerated: v.boolean(),
    theme: v.optional(v.string()),
    isBackup: v.boolean(),
  }).index("by_date", ["date"]),
});

export default schema;
