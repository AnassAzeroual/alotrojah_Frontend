import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
const KEY = 'alotrojah_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(
    (localStorage.getItem(KEY) as ThemeMode) ?? 'dark',
  );

  constructor() {
    effect(() => {
      const m = this.mode();
      document.documentElement.dataset['theme'] = m;
      document.documentElement.style.colorScheme = m;
      localStorage.setItem(KEY, m);
      document.querySelector('meta[name="theme-color"]')?.setAttribute(
        'content',
        m === 'dark' ? '#0b1512' : '#f8fafc',
      );
    });
  }

  toggle(): void {
    this.mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }
}
