import { inject, Injectable } from '@angular/core';
import { StorageService as NgCryptoStorage } from 'ng-cryptostore';
import { STORAGE_SECRET } from './storage-secret';

/**
 * At-rest encryption for browser storage, backed by ng-cryptostore (crypto-js
 * AES-128-CBC with the shared STORAGE_SECRET passphrase) on sessionStorage.
 * The API mirrors the `localStorage`-style calls it replaces so existing call
 * sites keep their `JSON.parse` / string semantics — the vault stores the same
 * string a plain `setItem` would have.
 *
 * Threat model: this degrades raw browser-storage dumps to ciphertext so a
 * reader who only steals the storage (devtools, a third-party extension) cannot
 * read the JWT, per-user prefs or UI choices. It is NOT a substitute for
 * authentication or HttpOnly cookies — the key lives in the same bundle as the
 * app, so XSS in this app can still read everything. It is a deliberate
 * speed-bump, not a vault.
 *
 * Session scope: sessionStorage is per-tab, so closing the tab ends the
 * session — the token, prefs, theme and language do NOT survive a closed tab
 * (a reload in the same tab keeps them). That is deliberate.
 *
 * `read` never throws: ng-cryptostore's `get()` returns null/'' for a missing
 * key and throws on an undecryptable value, in which case we fall back to the
 * raw sessionStorage string (plaintext written before the vault, or corruption)
 * so a live session keeps working and is re-encrypted on the next write.
 * `write` is fire-and-forget: the library's `set()` runs its encrypt +
 * `setItem` synchronously before its promise resolves, so a `read` right after
 * a `write` is deterministic.
 *
 * Legacy adoption: the vault used to live in localStorage under the same secret
 * and wire format, so an old entry is moved to sessionStorage verbatim — the
 * ciphertext decrypts in its new home, and a plaintext one still lands on the
 * raw fallback. The localStorage copy is deleted in the same step, and on every
 * `write`/`remove`, so nothing (least of all a logged-out token) survives in the
 * old backend.
 *
 * Deliberate exception: `E2E_CACHE_BYPASS_KEY` in ApiClient stays plaintext in
 * localStorage — it is a test-only HTTP-cache switch, not user data, and e2e
 * specs toggle it outside the Angular runtime where they have no DI (and
 * Playwright's storageState cannot seed sessionStorage). The theme keeps a
 * plaintext mirror for the same reason — see ThemeService.
 */
@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private readonly store = inject(NgCryptoStorage);

  /** Read-and-decrypt. `null` for a missing/empty value; an empty vault first
   *  adopts any legacy localStorage value. Undecryptable values fall back to
   *  their raw sessionStorage string so nothing breaks. */
  read<T = string>(key: string): T | null {
    const raw = sessionStorage.getItem(key);
    if (raw === null) return this.adoptLegacy<T>(key);
    try {
      const v = this.store.get(key, STORAGE_SECRET) as unknown;
      if (v === null || v === undefined || v === '') return null;
      return v as T;
    } catch {
      return raw as unknown as T;
    }
  }

  /** Encrypt-and-write. Value round-trips through JSON, like `setItem`. */
  write(key: string, value: string): void {
    localStorage.removeItem(key);
    void this.store.set(key, value, STORAGE_SECRET);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
    this.store.remove(key);
  }

  /** Move a pre-sessionStorage value into the vault, then drop the old copy.
   *  Recursive by design: the second `read` finds the key in sessionStorage. */
  private adoptLegacy<T>(key: string): T | null {
    const legacy = localStorage.getItem(key);
    if (legacy === null) return null;
    localStorage.removeItem(key);
    sessionStorage.setItem(key, legacy);
    return this.read<T>(key);
  }
}
