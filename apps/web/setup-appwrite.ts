import { Client, Databases, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function setupCollection(collectionId: string, name: string, permissions: string[], attributesSetupFn: (db: Databases, dbId: string, collId: string) => Promise<void>) {
    console.log(`Checking collection ${name} (${collectionId})...`);
    
    let collectionExists = false;
    try {
        await databases.getCollection(DB_ID, collectionId);
        collectionExists = true;
        console.log(`Collection ${name} exists.`);
    } catch (e: any) {
        if (e.code === 404) {
            console.log(`Collection ${name} not found. Creating...`);
            await databases.createCollection(DB_ID, collectionId, name, permissions);
            console.log(`Created collection: ${name}`);
        } else {
            throw e;
        }
    }

    if (collectionExists) {
        // If it exists, update permissions just in case
        await databases.updateCollection(DB_ID, collectionId, name, permissions);
        console.log(`Updated permissions for collection: ${name}`);
    }

    try {
        console.log(`Setting up attributes for ${name}...`);
        await attributesSetupFn(databases, DB_ID, collectionId);
        console.log(`Finished setting up attributes for ${name}.\n`);
    } catch (e: any) {
        if (e.code !== 409) { // Ignore 'Attribute already exists' errors
            console.error(`Error setting up attributes for ${name}:`, e);
            throw e;
        }
    }
}

// Utility to create attribute, ignoring if it exists
async function createStringAttribute(dbId: string, collId: string, key: string, size: number, required: boolean) {
    try { await databases.createStringAttribute(dbId, collId, key, size, required); } catch (e: any) { if (e.code !== 409) throw e; }
}

async function createIntegerAttribute(dbId: string, collId: string, key: string, required: boolean) {
    try { await databases.createIntegerAttribute(dbId, collId, key, required); } catch (e: any) { if (e.code !== 409) throw e; }
}

async function createEmailAttribute(dbId: string, collId: string, key: string, required: boolean) {
    try { await databases.createEmailAttribute(dbId, collId, key, required); } catch (e: any) { if (e.code !== 409) throw e; }
}

async function main() {
    try {
        const defaultPermissions = [
            Permission.create(Role.users()),
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users())
        ];

        // 1. Users Collection
        await setupCollection(
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            "Users",
            defaultPermissions,
            async (db, dbId, collId) => {
                await createStringAttribute(dbId, collId, "name", 255, false);
                await createEmailAttribute(dbId, collId, "email", false);
                await createIntegerAttribute(dbId, collId, "streak", false);
                await createIntegerAttribute(dbId, collId, "totalScore", false);
                await createStringAttribute(dbId, collId, "lastWorkoutDate", 255, false);
                await createStringAttribute(dbId, collId, "groupId", 255, false);
            }
        );

        // 2. Workouts Collection
        await setupCollection(
            process.env.NEXT_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID!,
            "Workouts",
            defaultPermissions,
            async (db, dbId, collId) => {
                await createStringAttribute(dbId, collId, "userId", 255, false);
                await createStringAttribute(dbId, collId, "date", 255, false);
                await createIntegerAttribute(dbId, collId, "totalScore", false);
                await createIntegerAttribute(dbId, collId, "memorizationScore", false);
                await createIntegerAttribute(dbId, collId, "contextScore", false);
                await createIntegerAttribute(dbId, collId, "verseMatchScore", false);
                await createIntegerAttribute(dbId, collId, "rearrangeScore", false);
            }
        );

        // 3. Practice History Collection
        await setupCollection(
            process.env.NEXT_PUBLIC_APPWRITE_PRACTICE_COLLECTION_ID!,
            "Practice History",
            defaultPermissions,
            async (db, dbId, collId) => {
                await createStringAttribute(dbId, collId, "userId", 255, false);
                await createStringAttribute(dbId, collId, "timestamp", 255, false);
                await createStringAttribute(dbId, collId, "drillType", 255, false);
                await createIntegerAttribute(dbId, collId, "score", false);
                await createIntegerAttribute(dbId, collId, "accuracy", false);
                await createStringAttribute(dbId, collId, "config", 1000, false);
            }
        );

        // 4. Mastery Collection
        await setupCollection(
            process.env.NEXT_PUBLIC_APPWRITE_MASTERY_COLLECTION_ID!,
            "Mastery",
            defaultPermissions,
            async (db, dbId, collId) => {
                await createStringAttribute(dbId, collId, "userId", 255, false);
                await createStringAttribute(dbId, collId, "referenceId", 255, false);
                await createStringAttribute(dbId, collId, "passageReference", 255, false);
                await createStringAttribute(dbId, collId, "passageText", 1500, false);
                await createIntegerAttribute(dbId, collId, "currentLevel", false);
                await createIntegerAttribute(dbId, collId, "bestAccuracy", false);
                await createIntegerAttribute(dbId, collId, "bestTime", false);
                await createStringAttribute(dbId, collId, "status", 255, false);
                await createStringAttribute(dbId, collId, "lastPracticed", 255, false);
            }
        );

        console.log("All schemas and permissions have been successfully set up!");

    } catch (error) {
        console.error("An error occurred during setup:", error);
    }
}

main();
