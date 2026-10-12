import { TestBed } from '@angular/core/testing';
import { provideNgCryptoStore } from 'ng-cryptostore';
import { SecureStorageService } from './secure-storage.service';

describe('SecureStorageService', () => {
  let storage: SecureStorageService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    // Mirror app.config.ts — without this the vault falls back to its
    // localStorage default and the specs would test the wrong backend.
    TestBed.configureTestingModule({
      providers: [provideNgCryptoStore({ storageType: 'sessionStorage' })],
    });
    storage = TestBed.inject(SecureStorageService);
  });

  it('round-trips a string through the vault (ciphertext at rest)', () => {
    storage.write('k', 'hello');
    // At rest it is encrypted, not plaintext…
    expect(sessionStorage.getItem('k')).not.toBe('hello');
    // …and reads back the original payload.
    expect(storage.read('k')).toBe('hello');
  });

  it('reads null for a missing key', () => {
    expect(storage.read('missing')).toBeNull();
  });

  it('falls back to a raw plaintext value (migration path)', () => {
    sessionStorage.setItem('legacy', 'T');
    expect(storage.read('legacy')).toBe('T');
  });

  it('falls back to a corrupt value instead of throwing', () => {
    sessionStorage.setItem('corrupt', 'not-ciphertext{{{');
    expect(storage.read('corrupt')).toBe('not-ciphertext{{{');
  });

  it('removes a stored value', () => {
    storage.write('k', 'v');
    expect(storage.read('k')).toBe('v');
    storage.remove('k');
    expect(storage.read('k')).toBeNull();
    expect(sessionStorage.getItem('k')).toBeNull();
  });

  it('round-trips JSON strings exactly (admin prefs payload shape)', () => {
    const prefs = JSON.stringify({ hideScopePickers: true, showCenterId: false });
    storage.write('alotrojah_prefs.1', prefs);
    expect(storage.read('alotrojah_prefs.1')).toBe(prefs);
    expect(storage.read('alotrojah_prefs.1')).toContain('"hideScopePickers":true');
  });

  describe('legacy localStorage adoption', () => {
    // The vault used to sit in localStorage with the same secret and format, so
    // an old entry is real ciphertext. Produce a genuine one instead of a stub.
    const realCiphertext = (): string => {
      storage.write('probe', 'hello');
      return sessionStorage.getItem('probe')!;
    };

    it('decrypts a legacy ciphertext value and purges the localStorage copy', () => {
      const cipher = realCiphertext();
      sessionStorage.clear();
      localStorage.setItem('alotrojah_token', cipher);

      expect(storage.read('alotrojah_token')).toBe('hello');
      expect(localStorage.getItem('alotrojah_token')).toBeNull();
      expect(sessionStorage.getItem('alotrojah_token')).toBe(cipher);
    });

    it('adopts a pre-vault plaintext value, then re-encrypts on the next write', () => {
      localStorage.setItem('alotrojah_lang', 'fr');

      expect(storage.read('alotrojah_lang')).toBe('fr');
      expect(localStorage.getItem('alotrojah_lang')).toBeNull();

      storage.write('alotrojah_lang', 'ar');
      expect(sessionStorage.getItem('alotrojah_lang')).not.toBe('ar');
      expect(storage.read('alotrojah_lang')).toBe('ar');
    });

    it('never leaves the old backend holding a value on write or remove', () => {
      localStorage.setItem('alotrojah_token', 'stale');
      storage.write('alotrojah_token', 'fresh');
      expect(localStorage.getItem('alotrojah_token')).toBeNull();
      expect(storage.read('alotrojah_token')).toBe('fresh');

      // A stale entry appearing after logout must not survive the next logout.
      localStorage.setItem('alotrojah_token', 'stale');
      storage.remove('alotrojah_token');
      expect(localStorage.getItem('alotrojah_token')).toBeNull();
      expect(sessionStorage.getItem('alotrojah_token')).toBeNull();
      expect(storage.read('alotrojah_token')).toBeNull();
    });
  });
});
