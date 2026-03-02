import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

import { Client, Databases } from "node-appwrite";

async function checkPermissions() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  const databases = new Databases(client);

  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const COLLS = [
    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID!,
  ];

  for (const coll of COLLS) {
    try {
      const dbColl = await databases.getCollection(DB_ID, coll);
      console.log(
        `Collection ${dbColl.name} (${coll}) permissions:`,
        dbColl.$permissions,
      );
    } catch (e) {
      console.error(e);
    }
  }
}

checkPermissions();
