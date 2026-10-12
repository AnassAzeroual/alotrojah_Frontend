import { TestBed } from '@angular/core/testing';
import { provideNgCryptoStore } from 'ng-cryptostore';
import { SecureStorageService } from '../storage/secure-storage.service';
import { ThemeService } from './theme.service';

const KEY = 'alotrojah_theme';

describe('ThemeService', () => {
  let storage: SecureStorageService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        // Mirror app.config.ts vault backend (sessionStorage).
        provideNgCryptoStore({ storageType: 'sessionStorage' }),
      ],
    });
    storage = TestBed.inject(SecureStorageService);
  });

  const boot = () => {
    const theme = TestBed.inject(ThemeService);
    TestBed.flushEffects();
    return theme;
  };

  it('boots from the localStorage mirror the harness and index.html seed', () => {
    localStorage.setItem(KEY, 'light');
    const theme = boot();
    expect(theme.mode()).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });

  it('ignores a stray non-theme value in the mirror slot and falls back to the vault', () => {
    localStorage.setItem(KEY, 'not-a-theme');
    storage.write(KEY, 'light');
    expect(boot().mode()).toBe('light');
  });

  it('defaults to dark with nothing stored anywhere', () => {
    expect(boot().mode()).toBe('dark');
  });

  it('keeps the vault copy and the plaintext mirror in step on toggle', () => {
    const theme = boot();
    theme.toggle();
    TestBed.flushEffects();

    expect(theme.mode()).toBe('light');
    // Mirror stays readable pre-boot; the vault copy stays encrypted.
    expect(localStorage.getItem(KEY)).toBe('light');
    expect(storage.read(KEY)).toBe('light');
    expect(sessionStorage.getItem(KEY)).not.toBe('light');
  });
});
