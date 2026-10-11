import { inject, Injectable, signal, effect } from '@angular/core';
import { SecureStorageService } from '../storage/secure-storage.service';

export type ThemeMode = 'light' | 'dark';
const KEY = 'alotrojah_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(SecureStorageService);

  readonly mode = signal<ThemeMode>(this.storage.read(KEY) ?? 'dark');

  constructor() {
    effect(() => {
      const m = this.mode();
      document.documentElement.dataset['theme'] = m;
      document.documentElement.style.colorScheme = m;
      this.storage.write(KEY, m);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', m === 'dark' ? '#0b1512' : '#f8fafc');
    });
  }

  toggle(): void {
    this.mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }
}
