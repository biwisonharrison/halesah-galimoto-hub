import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  const hex = process.env.OTP_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "OTP_ENCRYPTION_KEY is missing or invalid. Set a 64-character hex string (openssl rand -hex 32) in your environment before configuring OTP providers."
    );
  }
  return Buffer.from(hex, "hex");
}

/** Encrypts a plaintext string (typically JSON.stringify'd provider credentials) into a single storable string. */
export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(".");
}

/** Decrypts a string produced by encryptSecret. Throws if the key or ciphertext don't match. */
export function decryptSecret(ciphertext: string): string {
  const key = getKey();
  const [ivB64, authTagB64, dataB64] = ciphertext.split(".");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Malformed encrypted credential value.");
  }
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}

/** Encrypts a full credentials object (all fields for one provider) as one blob. */
export function encryptCredentials(credentials: Record<string, string>): string {
  return encryptSecret(JSON.stringify(credentials));
}

/** Decrypts a credentials blob back into its field object. */
export function decryptCredentials(ciphertext: string): Record<string, string> {
  return JSON.parse(decryptSecret(ciphertext));
}

/** Masks a secret value for display — keeps the last 4 characters, blanks the rest. */
export function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length <= 4) return "••••";
  return `••••${value.slice(-4)}`;
}
