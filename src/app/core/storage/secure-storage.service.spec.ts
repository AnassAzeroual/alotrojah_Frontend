import { TestBed } from '@angular/core/testing';
import { SecureStorageService } from './secure-storage.service';

describe('SecureStorageService', () => {
  let storage: SecureStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    storage = TestBed.inject(SecureStorageService);
  });

  it('round-trips a string through the vault (ciphertext at rest)', () => {
    storage.write('k', 'hello');
    // At rest it is encrypted, not plaintext…
    expect(localStorage.getItem('k')).not.toBe('hello');
    // …and reads back the original payload.
    expect(storage.read('k')).toBe('hello');
  });

  it('reads null for a missing key', () => {
    expect(storage.read('missing')).toBeNull();
  });

  it('falls back to a legacy plaintext value (migration path)', () => {
    localStorage.setItem('legacy', 'T');
    expect(storage.read('legacy')).toBe('T');
  });

  it('falls back to a corrupt value instead of throwing', () => {
    localStorage.setItem('corrupt', 'not-ciphertext{{{');
    expect(storage.read('corrupt')).toBe('not-ciphertext{{{');
  });

  it('removes a stored value', () => {
    storage.write('k', 'v');
    expect(storage.read('k')).toBe('v');
    storage.remove('k');
    expect(storage.read('k')).toBeNull();
    expect(localStorage.getItem('k')).toBeNull();
  });

  it('round-trips JSON strings exactly (admin prefs payload shape)', () => {
    const prefs = JSON.stringify({ hideScopePickers: true, showCenterId: false });
    storage.write('alotrojah_prefs.1', prefs);
    expect(storage.read('alotrojah_prefs.1')).toBe(prefs);
    expect(storage.read('alotrojah_prefs.1')).toContain('"hideScopePickers":true');
  });
});
