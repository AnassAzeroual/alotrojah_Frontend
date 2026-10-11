/**
 * Passphrase for at-rest encryption of browser storage (ng-cryptostore AES-CBC).
 *
 * It ships in the bundle by design — this is obfuscation-at-rest, not
 * authentication or XSS protection: anyone who can load the app can read the
 * key. What it buys us is that a raw `localStorage` dump (devtools, an
 * unrelated extension, a backing-store leak) no longer exposes the JWT,
 * per-user prefs or UI choice in cleartext. See the SecureStorageService doc
 * for the threat model and the deliberate exceptions.
 *
 * Keep this file free of Angular/Node imports so e2e specs (plain Playwright
 * TS, outside the Angular compiler) can import the same constant and decrypt
 * persisted values to assert on them.
 */
export const STORAGE_SECRET = 'alotrojah-at-rest-key-4f92c18e7b6d-2026';
