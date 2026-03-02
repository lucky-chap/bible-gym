import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Client, Databases } from "node-appwrite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

async function testSave() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const databases = new Databases(client);

  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const USERS_COLL_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

  try {
    const users = await databases.listDocuments(DB_ID, USERS_COLL_ID);
    if (!users.documents.length) {
      console.log("No users found");
      return;
    }
    const user = users.documents[0];
    console.log("lastWorkoutDate:", user.lastWorkoutDate);
    console.log("workout type:", typeof user.lastWorkoutDate);
  } catch (err) {
    console.error("Error writing to DB:", err);
  }
}
testSave();
