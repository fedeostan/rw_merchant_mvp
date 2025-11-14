import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

/**
 * Generate a secure random API key with the format: mnee_live_<32 random alphanumeric chars>
 * @returns The generated API key
 */
export function generateApiKey(): string {
  const prefix = "mnee_live_";
  const randomPart = randomBytes(24).toString("base64url").slice(0, 32);
  return `${prefix}${randomPart}`;
}

/**
 * Hash an API key using bcrypt
 * @param key The API key to hash
 * @returns The bcrypt hash
 */
export async function hashApiKey(key: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(key, saltRounds);
}

/**
 * Verify an API key against a bcrypt hash
 * @param key The API key to verify
 * @param hash The bcrypt hash to verify against
 * @returns True if the key matches the hash, false otherwise
 */
export async function verifyApiKey(
  key: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(key, hash);
}

/**
 * Extract the last 4 characters from an API key for display purposes
 * @param key The API key
 * @returns The last 4 characters
 */
export function getKeyLast4(key: string): string {
  return key.slice(-4);
}
