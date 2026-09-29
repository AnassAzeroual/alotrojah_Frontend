import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'ar' | 'fr' | 'en';

const LANG_KEY = 'alotrojah_lang';
const DIRS: Record<AppLang, 'rtl' | 'ltr'> = { ar: 'rtl', fr: 'ltr', en: 'ltr' };

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly current = signal<AppLang>((localStorage.getItem(LANG_KEY) as AppLang | null) ?? 'ar');
  readonly langs: readonly AppLang[] = ['ar', 'fr', 'en'];

  init(): void {
    this.apply(this.current());
  }

  use(lang: AppLang): void {
    localStorage.setItem(LANG_KEY, lang);
    this.current.set(lang);
    this.apply(lang);
  }

  private apply(lang: AppLang): void {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = DIRS[lang];
  }
}
