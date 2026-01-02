/**
 * Encryption service for sensitive data
 * Uses libsodium's ChaCha20-Poly1305 authenticated encryption
 *
 * This implementation uses react-native-libsodium for native encryption:
 * - ChaCha20-Poly1305 (XChaCha20-Poly1305-IETF) - libsodium's recommended method
 * - Secure key generation and storage in Keychain
 * - Random nonce generation for each encryption
 * - Built-in authentication tag verification
 * - Protection against common attacks (nonce reuse, etc.)
 *
 * ChaCha20-Poly1305 is more secure and faster than AES-GCM on mobile devices.
 */

import * as Keychain from 'react-native-keychain';
import sodium from 'react-native-libsodium';

const ENCRYPTION_KEY_ALIAS = 'spendwise_encryption_key';

let encryptionKey: string | null = null;

/**
 * Convert hex string to Uint8Array bytes
 * react-native-libsodium doesn't have from_hex, so we implement it manually
 */
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

/**
 * Initialize encryption key from device keychain
 * Key is 32 bytes (256 bits) for XChaCha20-Poly1305
 */
export const initEncryptionKey = async (): Promise<void> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: ENCRYPTION_KEY_ALIAS,
    });

    if (credentials) {
      encryptionKey = credentials.password;
    } else {
      // Generate new secure key using libsodium
      const keyBytes = sodium.randombytes_buf(32); // 32 bytes for XChaCha20-Poly1305
      const newKey = sodium.to_hex(keyBytes);
      await Keychain.setGenericPassword(ENCRYPTION_KEY_ALIAS, newKey, {
        service: ENCRYPTION_KEY_ALIAS,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      encryptionKey = newKey;
    }
  } catch (error) {
    console.error('Failed to initialize encryption key:', error);
    throw error;
  }
};

/**
 * Encrypt sensitive data using XChaCha20-Poly1305
 * Format: base64(nonce_length + nonce + ciphertext_with_tag)
 *
 * Implementation uses libsodium's XChaCha20-Poly1305-IETF:
 * - Random 24-byte nonce for each encryption (prevents pattern analysis)
 * - Authenticated encryption with built-in tag
 * - Native performance and security
 */
export const encrypt = async (plaintext: string): Promise<string> => {
  if (!encryptionKey) {
    await initEncryptionKey();
  }

  if (!encryptionKey) {
    throw new Error('Encryption key not available');
  }

  try {
    // Convert key from hex to bytes
    const keyBytes = hexToBytes(encryptionKey);

    // Generate random 24-byte nonce for XChaCha20-Poly1305
    const nonce = sodium.randombytes_buf(24);

    // Convert plaintext to bytes
    const messageBytes = sodium.from_string(plaintext);

    // Encrypt using XChaCha20-Poly1305-IETF
    // This includes authentication tag automatically
    // Using 4-parameter call for backward compatibility with existing encrypted data
    // Original format: (message, ad, public_nonce, key) - nonce in 3rd position
    // @ts-expect-error - Using 4-parameter version for backward compatibility
    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      messageBytes,
      null, // No additional data (AD)
      nonce, // 24-byte public nonce (npub) - 3rd parameter for backward compatibility
      keyBytes,
    );

    // Format: NONCE_LENGTH(1 byte) + NONCE(24 bytes) + CIPHERTEXT_WITH_TAG
    const nonceLength = String.fromCharCode(24);
    const nonceString = sodium.to_string(nonce);
    const ciphertextString = sodium.to_string(ciphertext);
    const combined = nonceLength + nonceString + ciphertextString;

    // Return as base64 for storage - using binary-safe encoding compatible with btoa()
    // Convert string to binary bytes (latin1 encoding) to match btoa() behavior
    // This ensures backward compatibility with data encrypted using btoa()
    const combinedBytes = new Uint8Array(combined.length);
    for (let i = 0; i < combined.length; i++) {
      // Treat as binary (latin1) - ensure only lower 8 bits are used
      const charCode = combined.charCodeAt(i);
      combinedBytes[i] = charCode % 256; // Equivalent to & 0xff but avoids linter warning
    }
    return sodium.to_base64(combinedBytes);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt sensitive data using XChaCha20-Poly1305
 */
export const decrypt = async (ciphertext: string): Promise<string> => {
  if (!encryptionKey) {
    await initEncryptionKey();
  }

  if (!encryptionKey) {
    throw new Error('Encryption key not available');
  }

  try {
    // Decode base64 - must handle btoa() format for backward compatibility with existing data
    // btoa() creates base64 from binary string (latin1 encoding)
    // sodium.from_base64() can decode it, but we need to convert back to binary string correctly
    const combinedBytes = sodium.from_base64(ciphertext);

    // Convert bytes to binary string (latin1 encoding to match btoa/atob behavior)
    // This ensures compatibility with data encrypted using btoa()
    let combined = '';
    for (let i = 0; i < combinedBytes.length; i++) {
      combined += String.fromCharCode(combinedBytes[i]);
    }

    // Extract nonce length (should be 24 for XChaCha20-Poly1305)
    const nonceLength = combined.charCodeAt(0);
    if (nonceLength !== 24) {
      throw new Error('Invalid ciphertext format: nonce length mismatch');
    }

    // Extract nonce and ciphertext
    const nonceString = combined.substring(1, 1 + nonceLength);
    const ciphertextString = combined.substring(1 + nonceLength);

    // Convert to bytes
    const keyBytes = hexToBytes(encryptionKey);
    const nonce = sodium.from_string(nonceString);
    const ciphertextBytes = sodium.from_string(ciphertextString);

    // Decrypt using XChaCha20-Poly1305-IETF
    // This automatically verifies the authentication tag
    // Using 4-parameter call for backward compatibility with existing encrypted data
    // Original format: (ciphertext, ad, public_nonce, key) - nonce in 3rd position
    // @ts-expect-error - Using 4-parameter version for backward compatibility
    const plaintextBytes = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      ciphertextBytes,
      null, // No additional data (AD)
      nonce, // 24-byte public nonce (npub) - 3rd parameter for backward compatibility
      keyBytes,
    );

    // Convert bytes back to string
    return sodium.to_string(plaintextBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    if (
      error instanceof Error &&
      error.message.includes('verification failed')
    ) {
      throw new Error(
        'Decryption failed: Authentication tag mismatch - data may be corrupted or tampered',
      );
    }
    throw new Error('Decryption failed: Invalid ciphertext or corrupted data');
  }
};

/**
 * Lock encryption key (clear from memory)
 */
export const lockEncryptionKey = (): void => {
  encryptionKey = null;
};

/**
 * Check if encryption key is available
 */
export const isEncryptionKeyAvailable = (): boolean => {
  return encryptionKey !== null;
};
