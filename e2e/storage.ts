import type { Page } from '@playwright/test';
import CryptoJS from 'crypto-js';
import { STORAGE_SECRET } from '../src/app/core/storage/storage-secret';

/**
 * Read a value written by the app's SecureStorageService. The vault is
 * ng-cryptostore on sessionStorage: AES-CBC ciphertext with the shared
 * STORAGE_SECRET, so e2e decrypts with the same parameters to assert on
 * stored content. The payload round-trips through JSON exactly like
 * ng-cryptostore's own `get()` (the app writes plain strings, which decrypt
 * to their quoted-JSON form, so we JSON.parse to restore the stored string).
 * Falls back to the raw value when it is not ciphertext — the app's own
 * raw-plaintext fallback path (legacy values lived in localStorage).
 */
export async function readStoredValue(page: Page, key: string): Promise<string | null> {
  const raw = await page.evaluate((k) => sessionStorage.getItem(k) ?? localStorage.getItem(k), key);
  if (!raw) return null;
  const decrypted = decryptWithSharedSecret(raw);
  return decrypted ?? raw;
}

function decryptWithSharedSecret(cipher: string): string | null {
  try {
    const words = CryptoJS.AES.decrypt(cipher, STORAGE_SECRET, {
      keySize: 128 / 8,
      iv: CryptoJS.enc.Utf8.parse(STORAGE_SECRET),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const out = CryptoJS.enc.Utf8.stringify(words);
    if (!out.length) return null;
    const parsed: unknown = JSON.parse(out);
    return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
  } catch {
    return null;
  }
}
