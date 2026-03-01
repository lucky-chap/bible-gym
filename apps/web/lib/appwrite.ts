import { Client, Account, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);

// Helper constants for database and collection IDs
export const APPWRITE_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const APPWRITE_USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
export const APPWRITE_MASTERY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MASTERY_COLLECTION_ID!;
export const APPWRITE_WORKOUTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_WORKOUTS_COLLECTION_ID!;
export const APPWRITE_PRACTICE_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PRACTICE_COLLECTION_ID!;
