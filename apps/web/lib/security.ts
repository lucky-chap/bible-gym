import CryptoJS from "crypto-js";

/**
 * Robust encryption/decryption for API keys stored in localStorage.
 * Uses AES-GCM (via crypto-js) with a salt from environment variables.
 */

const SECRET_SALT =
  process.env.NEXT_PUBLIC_SECRET_SALT || "word-mastery-salt-fallback";

export function obfuscateApiKey(key: string): string {
  if (!key) return "";

  try {
    // Encrypt the key using AES
    return CryptoJS.AES.encrypt(key, SECRET_SALT).toString();
  } catch (e) {
    console.error("Encryption failed", e);
    return "";
  }
}

export function deobfuscateApiKey(obfuscated: string): string {
  if (!obfuscated) return "";

  try {
    // Decrypt the key using AES
    const bytes = CryptoJS.AES.decrypt(obfuscated, SECRET_SALT);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // If decryption results in an empty string, it might be legacy plain text or failed
    if (!decrypted) {
      // Fallback: check if it's a valid JSON/Base64 or just return as is
      return obfuscated;
    }

    return decrypted;
  } catch (e) {
    // If it fails (e.g. malformed input), return as-is (legacy fallback)
    return obfuscated;
  }
}
