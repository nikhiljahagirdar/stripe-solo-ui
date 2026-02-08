import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// Ensure these are set in your .env file
const ENCRYPTION_KEY = process.env['NEXT_PUBLIC_ENCRYPTION_KEY'] ?? process.env['ENCRYPTION_KEY']; // Must be 256 bits (32 bytes)
const ENCRYPTION_IV = process.env['NEXT_PUBLIC_ENCRYPTION_IV'] ?? process.env['ENCRYPTION_IV'];   // Must be 128 bits (16 bytes)
const ALGORITHM = 'aes-256-cbc';

// Helper to generate keys for development (should not be used in production directly)
function generateKeyAndIV(): { key: string; iv: string } {
  const getRandomValues = (length: number) => {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const bytes = new Uint8Array(length);
      window.crypto.getRandomValues(bytes);
      return bytes;
    }
    return new Uint8Array(randomBytes(length));
  };

  const toHex = (bytes: Uint8Array) =>
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  const key = toHex(getRandomValues(32)); // 256 bits
  const iv = toHex(getRandomValues(16)); // 128 bits
  return { key, iv };
}

if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
  const { key, iv } = generateKeyAndIV();
  console.warn(`
  ============================================================
  WARNING: ENCRYPTION_KEY or ENCRYPTION_IV is not set.
  For development, you can use these in your .env file:
  ENCRYPTION_KEY="${key}"
  ENCRYPTION_IV="${iv}"
  ============================================================
  `);
}

/**
 * @function encrypt
 * @description Encrypts a given text using AES-256-CBC algorithm.
 * @param {string} text - The text to encrypt.
 * @returns {string} The encrypted text in hexadecimal format.
 * @throws {Error} If ENCRYPTION_KEY or ENCRYPTION_IV are not set.
 */
export async function encrypt(text: string): Promise<string> {
  if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
    throw new Error('Encryption key or IV not set. Cannot encrypt.');
  }

  if (typeof window === 'undefined') {
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const ivBuffer = Buffer.from(ENCRYPTION_IV, 'hex');

    const cipher = createCipheriv(ALGORITHM, keyBuffer, ivBuffer);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  if (!window.crypto?.subtle) {
    throw new Error('Crypto API not available for encryption.');
  }

  const hexToBytes = (hex: string) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  };

  const toHex = (bytes: ArrayBuffer) =>
    Array.from(new Uint8Array(bytes))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  const keyBytes = hexToBytes(ENCRYPTION_KEY);
  const ivBytes = hexToBytes(ENCRYPTION_IV);
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );

  const encoded = new TextEncoder().encode(text);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: ivBytes },
    key,
    encoded
  );

  return toHex(encrypted);
}

/**
 * @function decrypt
 * @description Decrypts a given hexadecimal string using AES-256-CBC algorithm.
 * @param {string} encryptedText - The encrypted text in hexadecimal format.
 * @returns {string} The decrypted text.
 * @throws {Error} If ENCRYPTION_KEY or ENCRYPTION_IV are not set.
 */
export async function decrypt(encryptedText: string): Promise<string> {
  if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
    throw new Error('Encryption key or IV not set. Cannot decrypt.');
  }

  if (typeof window === 'undefined') {
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    const ivBuffer = Buffer.from(ENCRYPTION_IV, 'hex');

    const decipher = createDecipheriv(ALGORITHM, keyBuffer, ivBuffer);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  if (!window.crypto?.subtle) {
    throw new Error('Crypto API not available for decryption.');
  }

  const hexToBytes = (hex: string) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  };

  const keyBytes = hexToBytes(ENCRYPTION_KEY);
  const ivBytes = hexToBytes(ENCRYPTION_IV);
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: ivBytes },
    key,
    hexToBytes(encryptedText)
  );

  return new TextDecoder().decode(decrypted);
}
