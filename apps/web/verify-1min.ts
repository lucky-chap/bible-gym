import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

import { getOrCreateDailyWorkout } from "./lib/daily-workout-server";
import { Client, Databases, Query } from "node-appwrite";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  const databases = new Databases(client);
  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const collId =
    process.env.NEXT_PUBLIC_APPWRITE_DAILY_WORKOUT_COLLECTION_ID ||
    "daily_workouts";

  const today = new Date().toISOString().split("T")[0];

  console.log("Cleaning up today's test data...");
  const docs = await databases.listDocuments(dbId, collId, [
    Query.equal("date", today),
  ]);
  for (const doc of docs.documents) {
    await databases.deleteDocument(dbId, collId, doc.$id);
  }

  console.log(`\n--- ATTEMPT 1: Generate Workout for Today (${today}) ---`);
  const startTime = Date.now();
  try {
    const w1 = await getOrCreateDailyWorkout(today);
    const duration = (Date.now() - startTime) / 1000;
    const doc = (
      await databases.listDocuments(dbId, collId, [Query.equal("date", today)])
    ).documents[0];
    console.log(
      `RESULT: ID: ${w1.id}, AI Flag in DB: ${doc.isAiGenerated}, Time: ${duration}s`,
    );
  } catch (err) {
    console.error("Attempt 1 failed:", err);
  }

  console.log(`\n--- WAITING 1 MINUTE ---`);
  await sleep(60000);

  console.log(`\n--- ATTEMPT 2: retry/Upgrade for Today (${today}) ---`);
  const startTime2 = Date.now();
  try {
    const w2 = await getOrCreateDailyWorkout(today);
    const duration2 = (Date.now() - startTime2) / 1000;
    const doc2 = (
      await databases.listDocuments(dbId, collId, [Query.equal("date", today)])
    ).documents[0];
    console.log(
      `RESULT: ID: ${w2.id}, AI Flag in DB: ${doc2.isAiGenerated}, Time: ${duration2}s`,
    );
  } catch (err) {
    console.error("Attempt 2 failed:", err);
  }

  console.log("\n--- TEST COMPLETE ---");
}

runTest();
