import { inject, Injectable } from '@angular/core';
import { StorageService as NgCryptoStorage } from 'ng-cryptostore';
import { STORAGE_SECRET } from './storage-secret';

/**
 * At-rest encryption for browser storage, backed by ng-cryptostore (crypto-js
 * AES-128-CBC with the shared STORAGE_SECRET passphrase). The API mirrors the
 * `localStorage` calls it replaces so existing call sites keep their
 * `JSON.parse` / string semantics — the vault stores the same string a plain
 * `setItem` would have.
 *
 * Threat model: this degrades raw `localStorage` dumps to ciphertext so a
 * reader who only steals the storage (devtools, a third-party extension, a
 * synced/backed-up profile) cannot read the JWT, per-user prefs or UI choices.
 * It is NOT a substitute for authentication or HttpOnly cookies — the key
 * lives in the same bundle as the app, so XSS in this app can still read
 * everything. It is a deliberate speed-bump, not a vault.
 *
 * Migration: values written before this service existed are plaintext. `read`
 * tries the decrypt path first and falls back to the raw `localStorage` value
 * on any failure (missing key, corrupt value, legacy plaintext), so a live
 * session keeps working across the switch and is re-encrypted on the next
 * write. `write` is fire-and-forget: the library's `set()` runs its encrypt +
 * `setItem` synchronously before its promise resolves, so a `read` right after
 * a `write` is deterministic.
 *
 * Deliberate exception: `E2E_CACHE_BYPASS_KEY` in ApiClient stays plaintext —
 * it is a test-only HTTP-cache switch, not user data, and e2e specs toggle it
 * outside the Angular runtime where they have no DI.
 */
@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private readonly store = inject(NgCryptoStorage);

  /** Read-and-decrypt. `null` for a missing/empty value; undecryptable values
   *  fall back to their legacy plaintext so nothing breaks mid-migration. */
  read<T = string>(key: string): T | null {
    try {
      const v = this.store.get(key, STORAGE_SECRET) as unknown;
      if (v === null || v === undefined || v === '') return null;
      return v as T;
    } catch {
      const raw = localStorage.getItem(key);
      return raw === null ? null : (raw as unknown as T);
    }
  }

  /** Encrypt-and-write. Value round-trips through JSON, like `setItem`. */
  write(key: string, value: string): void {
    void this.store.set(key, value, STORAGE_SECRET);
  }

  remove(key: string): void {
    this.store.remove(key);
  }
}
