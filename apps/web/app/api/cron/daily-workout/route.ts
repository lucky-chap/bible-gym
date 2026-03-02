import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDailyWorkout } from "@/lib/daily-workout-server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const targetDate = searchParams.get("targetDate") || undefined;
  const isBackup = searchParams.get("isBackup") === "true";

  // Simple protection for the cron job
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const workout = await getOrCreateDailyWorkout(targetDate, { isBackup });

    // Check if we successfully upgraded to AI or are still on fallback
    const { databaseId, collectionId } = {
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      collectionId:
        process.env.NEXT_PUBLIC_APPWRITE_DAILY_WORKOUT_COLLECTION_ID ||
        "daily_workouts",
    };

    // Check the latest state to see if upgrade succeeded
    const isAi =
      (workout as any).id.startsWith("global-workout") &&
      !(workout as any).id.includes("fallback");

    return NextResponse.json({
      message: isAi ? "AI Generation Successful" : "Using Hard-coded Fallback",
      workoutId: workout.id,
      date: workout.date,
      isAiGenerated: isAi,
      isBackup,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
