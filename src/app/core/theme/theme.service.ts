import { inject, Injectable, signal, effect } from '@angular/core';
import { SecureStorageService } from '../storage/secure-storage.service';

export type ThemeMode = 'light' | 'dark';
const KEY = 'alotrojah_theme';

/**
 * The vault is sessionStorage, so it is unreadable before Angular boots — and
 * the theme must be applied pre-paint or every reload flashes dark. Theme is
 * also not secret, so it keeps a deliberate plaintext exception (like
 * `E2E_CACHE_BYPASS_KEY`): a `light`/`dark` mirror in localStorage that
 * `index.html`'s pre-boot guard and the screenshot harness can read. The mirror
 * outlives a closed tab; the vault copy stays the encrypted record of it.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(SecureStorageService);

  readonly mode = signal<ThemeMode>(
    this.readMirror() ?? this.storage.read<ThemeMode>(KEY) ?? 'dark',
  );

  constructor() {
    effect(() => {
      const m = this.mode();
      document.documentElement.dataset['theme'] = m;
      document.documentElement.style.colorScheme = m;
      this.storage.write(KEY, m);
      // After the vault write, which purges this key from localStorage.
      localStorage.setItem(KEY, m);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', m === 'dark' ? '#0b1512' : '#f8fafc');
    });
  }

  toggle(): void {
    this.mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  /** Only an exact `light`/`dark` counts; anything else (stray ciphertext) is ignored. */
  private readMirror(): ThemeMode | null {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  }
}
