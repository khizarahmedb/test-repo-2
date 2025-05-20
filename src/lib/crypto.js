// src/utils/crypto.js
import scrypt from "scrypt-js"; // Import scrypt-js

// IMPORTANT: Ensure this environment variable is set in .env.local
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET_KEY;

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256; // 256 bits for AES-256
const IV_LENGTH_BYTES = 12; // 96 bits = 12 bytes for AES-GCM IV

// Scrypt parameters - THESE MUST EXACTLY MATCH YOUR BACKEND'S scryptSync PARAMETERS
// For Node.js crypto.scryptSync with only secretKey, salt, and keylen,
// the defaults are N=16384 (2^14), r=8, p=1. CONFIRM THIS FOR YOUR NODE.JS VERSION.
const SCRIPT_N = 16384; // 2^14
const SCRIPT_R = 8;
const SCRIPT_P = 1;
const SCRIPT_DKLEN = 32; // Derived key length in bytes (32 bytes = 256 bits)
const SCRIPT_SALT = new TextEncoder().encode("salt"); // MUST match backend's 'salt' string

let cachedCryptoKey = null;

// Function to derive the encryption key using scrypt
async function deriveKey(secret) {
  if (cachedCryptoKey) {
    return cachedCryptoKey;
  }

  if (!secret) {
    console.error("Encryption secret key is not provided.");
    throw new Error("Encryption secret key is missing.");
  }

  try {
    // scrypt-js's scrypt function expects Uint8Array for password and salt
    const passwordBytes = new TextEncoder().encode(secret);

    // Perform scrypt key derivation (asynchronous)
    const derivedKeyBytes = await scrypt.scrypt(
      passwordBytes,
      SCRIPT_SALT,
      SCRIPT_N,
      SCRIPT_R,
      SCRIPT_P,
      SCRIPT_DKLEN
    );

    // Import the derived key bytes into the Web Crypto API
    cachedCryptoKey = await crypto.subtle.importKey(
      "raw",
      derivedKeyBytes, // Use the scrypt-derived key directly
      { name: ALGORITHM, length: KEY_LENGTH },
      true, // Make it extractable for caching (false for stronger production security, but then no caching)
      ["encrypt", "decrypt"]
    );
    return cachedCryptoKey;
  } catch (error) {
    console.error("Frontend scrypt key derivation failed:", error);
    throw new Error("Failed to derive encryption key.");
  }
}

/**
 * Encrypts data using AES-256-GCM.
 * @param {object} data The data to encrypt (will be JSON.stringified).
 * @returns {Promise<{iv: string, tag: string, encryptedData: string}>} The encrypted payload.
 */
export async function encryptData(data) {
  if (!SECRET_KEY) {
    console.warn(
      "NEXT_PUBLIC_ENCRYPTION_SECRET_KEY is not set. Skipping encryption."
    );
    return data; // Return original data if key is missing
  }

  try {
    const key = await deriveKey(SECRET_KEY);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES)); // Generate a random IV

    const encoder = new TextEncoder();
    const dataToEncrypt = encoder.encode(JSON.stringify(data));

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      dataToEncrypt
    );

    const tagLength = 16; // AES-GCM generates a 16-byte (128-bit) authentication tag
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const encryptedData = encryptedBytes.slice(
      0,
      encryptedBytes.length - tagLength
    );
    const authTag = encryptedBytes.slice(encryptedBytes.length - tagLength);

    return {
      iv: Array.from(iv)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
      tag: Array.from(authTag)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
      encryptedData: Array.from(encryptedData)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    };
  } catch (error) {
    console.error("Frontend encryption failed:", error);
    throw new Error("Frontend encryption failed.");
  }
}

/**
 * Decrypts data using AES-256-GCM.
 * @param {{iv: string, tag: string, encryptedData: string}} encryptedPayload The encrypted payload from the backend.
 * @returns {Promise<object>} The decrypted data.
 */
export async function decryptData(encryptedPayload) {
  if (!SECRET_KEY) {
    console.warn(
      "NEXT_PUBLIC_ENCRYPTION_SECRET_KEY is not set. Skipping decryption."
    );
    return encryptedPayload;
  }

  const { iv, tag, encryptedData } = encryptedPayload;

  if (!iv || !tag || !encryptedData) {
    return encryptedPayload;
  }

  try {
    const key = await deriveKey(SECRET_KEY);

    const ivBuffer = Uint8Array.from(
      iv.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
    const tagBuffer = Uint8Array.from(
      tag.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );
    const encryptedDataBuffer = Uint8Array.from(
      encryptedData.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );

    const fullEncryptedBuffer = new Uint8Array(
      encryptedDataBuffer.length + tagBuffer.length
    );
    fullEncryptedBuffer.set(encryptedDataBuffer, 0);
    fullEncryptedBuffer.set(tagBuffer, encryptedDataBuffer.length);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: ivBuffer,
        tagLength: 128, // 128 bits for AES-GCM
      },
      key,
      fullEncryptedBuffer
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedBuffer));
  } catch (error) {
    console.error("Frontend decryption failed:", error);
    throw new Error("Frontend decryption failed or data is invalid.");
  }
}
