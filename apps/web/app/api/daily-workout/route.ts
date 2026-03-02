import { NextResponse } from "next/server";
import { getOrCreateDailyWorkout } from "@/lib/daily-workout-server";

export async function GET() {
  try {
    const workout = await getOrCreateDailyWorkout();
    return NextResponse.json(workout);
  } catch (error) {
    console.error("API error fetching daily workout:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily workout" },
      { status: 500 },
    );
  }
}
