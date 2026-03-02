import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

import { Client, Databases, ID } from "node-appwrite";

async function testSave() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const databases = new Databases(client);

  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const USERS_COLL_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
  const WORKOUTS_COLL_ID =
    process.env.NEXT_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID!;

  try {
    console.log("Fetching first user...");
    const users = await databases.listDocuments(DB_ID, USERS_COLL_ID);
    if (!users.documents.length) {
      console.log("No users found to test with.");
      return;
    }
    const user = users.documents[0];
    console.log(`Found user: ${user.$id}. Updating score...`);

    const newScore = (user.totalScore || 0) + 10;

    // Update Document
    await databases.updateDocument(DB_ID, USERS_COLL_ID, user.$id, {
      totalScore: newScore,
    });
    console.log("User updated successfully!");

    // Create Workout record
    await databases.createDocument(DB_ID, WORKOUTS_COLL_ID, ID.unique(), {
      userId: user.$id,
      date: new Date().toISOString().split("T")[0],
      totalScore: 10,
      memorizationScore: 5,
      contextScore: 5,
      verseMatchScore: 0,
      rearrangeScore: 0,
    });
    console.log("Workout record created successfully!");
  } catch (err) {
    console.error("Error writing to DB:", err);
  }
}

testSave();
