import { Client, Databases, Query } from "node-appwrite";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const appwriteClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(appwriteClient);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const APPWRITE_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function migrate() {
  console.log("Starting migration from Appwrite to Convex...");

  // 1. Migrate Users (Note: Auth users are separate in Convex, but we need profiles)
  // Actually, Convex Auth handles user creation on login.
  // We might want to migrate profile data if it exists.
  // For now, let's focus on Workouts, PracticeHistory, and Groups.

  // 2. Migrate Groups
  console.log("Migrating Groups...");
  try {
    const groups = await databases.listDocuments(
      APPWRITE_DB_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
      [Query.limit(100)],
    );
    for (const doc of groups.documents) {
      // We can't directly use mutation if it requires auth.
      // We might need internal mutations or a special migration mutation.
      console.log(`Migrating group: ${doc.name}`);
      // TODO: Implement server-side migration mutation
    }
  } catch (e) {
    console.error("Error migrating groups:", e);
  }

  // 3. Migrate Workouts
  console.log("Migrating Workouts...");
  // ... similar logic

  console.log("Migration complete!");
}

// migrate();
