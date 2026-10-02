import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'ar' | 'fr' | 'en';

const LANG_KEY = 'alotrojah_lang';
const DEFAULT: AppLang = 'ar';
const DIRS: Record<AppLang, 'rtl' | 'ltr'> = { ar: 'rtl', fr: 'ltr', en: 'ltr' };

function readStored(): AppLang {
  const v = localStorage.getItem(LANG_KEY);
  return v === 'ar' || v === 'fr' || v === 'en' ? v : DEFAULT;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly current = signal<AppLang>(readStored());
  readonly langs: readonly AppLang[] = ['ar', 'fr', 'en'];

  constructor() {
    // If the applied language ever changes outside this service, sync the
    // selector back so it always shows the language actually in effect.
    this.translate.onLangChange.subscribe((e) => {
      const lang = e.lang as AppLang;
      if (this.langs.includes(lang) && lang !== this.current()) {
        this.current.set(lang);
        localStorage.setItem(LANG_KEY, lang);
        this.applyDir(lang);
      }
    });
  }

  /** Boot check: re-read the stored selection and apply it authoritatively. */
  init(): void {
    this.use(readStored());
  }

  use(lang: AppLang): void {
    localStorage.setItem(LANG_KEY, lang);
    this.current.set(lang);
    this.translate.use(lang);
    this.applyDir(lang);
  }

  private applyDir(lang: AppLang): void {
    document.documentElement.lang = lang;
    document.documentElement.dir = DIRS[lang];
  }
}
