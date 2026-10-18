import type { Page } from '@playwright/test';
import { createDecipheriv, createHmac, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import { STORAGE_SECRET } from '../src/app/core/storage/storage-secret';

/**
 * Reads a vault value the app wrote through ng-cryptostore.
 *
 * Current payloads are the library's authenticated v2 envelope:
 * `v2.<salt>.<iv>.<ciphertext>.<mac>` with base64url parts, keys derived via
 * PBKDF2-SHA256 (1000 iterations) into AES-256-CBC + HMAC-SHA256. Anything
 * that is not a v2 payload (plaintext written before the vault) is returned
 * raw, mirroring SecureStorageService.read.
 */
export async function readStoredValue(page: Page, key: string): Promise<string | null> {
  const raw = await page.evaluate((k) => sessionStorage.getItem(k) ?? localStorage.getItem(k), key);
  if (!raw) return null;
  return decryptV2(raw) ?? raw;
}

function decryptV2(payload: string): string | null {
  if (!payload.startsWith('v2.')) return null;
  const parts = payload.slice(3).split('.');
  if (parts.length !== 4) return null;
  const [saltPart, ivPart, cipherPart, macPart] = parts;
  const salt = Buffer.from(saltPart, 'base64url');
  const iv = Buffer.from(ivPart, 'base64url');
  const ciphertext = Buffer.from(cipherPart, 'base64url');
  const mac = Buffer.from(macPart, 'base64url');
  if (salt.length !== 16 || iv.length !== 16 || mac.length !== 32) return null;

  const material = pbkdf2Sync(STORAGE_SECRET, salt, 1000, 64, 'sha256');
  const expectedMac = createHmac('sha256', material.subarray(32))
    .update(`${saltPart}.${ivPart}.${cipherPart}`)
    .digest();
  if (!timingSafeEqual(expectedMac, mac)) return null;

  try {
    const decipher = createDecipheriv('aes-256-cbc', material.subarray(0, 32), iv);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    // StorageService JSON-encodes the stored value; SecureStorageService writes
    // strings, so unwrap that JSON string layer.
    const parsed: unknown = JSON.parse(plain);
    return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
  } catch {
    return null;
  }
}
