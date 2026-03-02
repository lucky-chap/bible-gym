import { Group } from "../types";

export function parseGroupDoc(doc: any): Group {
  return {
    ...doc,
    id: doc.$id,
    groupChallenge:
      typeof doc.groupChallenge === "string"
        ? JSON.parse(doc.groupChallenge)
        : doc.groupChallenge || null,
    leftMembers: doc.leftMembers || [],
  } as unknown as Group;
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
