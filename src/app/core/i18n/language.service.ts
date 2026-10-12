import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SecureStorageService } from '../storage/secure-storage.service';

export type AppLang = 'ar' | 'fr' | 'en';

const LANG_KEY = 'alotrojah_lang';
const DEFAULT: AppLang = 'ar';
const DIRS: Record<AppLang, 'rtl' | 'ltr'> = { ar: 'rtl', fr: 'ltr', en: 'ltr' };

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storage = inject(SecureStorageService);
  private readonly translate = inject(TranslateService);

  readonly current = signal<AppLang>(this.readStored());
  readonly langs: readonly AppLang[] = ['ar', 'fr', 'en'];

  constructor() {
    // If the applied language ever changes outside this service, sync the
    // selector back so it always shows the language actually in effect.
    this.translate.onLangChange.subscribe((e) => {
      const lang = e.lang as AppLang;
      if (this.langs.includes(lang) && lang !== this.current()) {
        this.current.set(lang);
        this.storage.write(LANG_KEY, lang);
        this.applyDir(lang);
      }
    });
  }

  /** Boot check: re-read the stored selection and apply it authoritatively. */
  init(): void {
    this.use(this.readStored());
  }

  use(lang: AppLang): void {
    this.storage.write(LANG_KEY, lang);
    this.current.set(lang);
    this.translate.use(lang);
    this.applyDir(lang);
  }

  private readStored(): AppLang {
    const v = this.storage.read(LANG_KEY);
    return v === 'ar' || v === 'fr' || v === 'en' ? v : DEFAULT;
  }

  private applyDir(lang: AppLang): void {
    document.documentElement.lang = lang;
    document.documentElement.dir = DIRS[lang];
  }
}
