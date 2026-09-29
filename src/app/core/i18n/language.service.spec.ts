import { TestBed } from '@angular/core/testing';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateNoOpLoader } from '@ngx-translate/core';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let lang: LanguageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideTranslateService({ loader: provideTranslateLoader(() => new TranslateNoOpLoader()) })],
    });
    lang = TestBed.inject(LanguageService);
  });

  it('defaults to Arabic RTL', () => {
    lang.init();
    expect(lang.current()).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('switches language, dir and persistence', () => {
    lang.use('fr');
    expect(lang.current()).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
    expect(document.documentElement.dir).toBe('ltr');
    expect(localStorage.getItem('alotrojah_lang')).toBe('fr');
  });

  it('restores the stored language', () => {
    localStorage.setItem('alotrojah_lang', 'en');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideTranslateService({ loader: provideTranslateLoader(() => new TranslateNoOpLoader()) })],
    });
    const fresh = TestBed.inject(LanguageService);
    expect(fresh.current()).toBe('en');
  });
});
