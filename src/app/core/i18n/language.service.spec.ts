import { TestBed } from '@angular/core/testing';
import { provideNgCryptoStore } from 'ng-cryptostore';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateNoOpLoader } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { SecureStorageService } from '../storage/secure-storage.service';

describe('LanguageService', () => {
  let lang: LanguageService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        // Mirror app.config.ts vault backend (sessionStorage).
        provideNgCryptoStore({ storageType: 'sessionStorage' }),
      ],
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
    expect(TestBed.inject(SecureStorageService).read('alotrojah_lang')).toBe('fr');
  });

  it('falls back to Arabic for an invalid stored value', () => {
    sessionStorage.setItem('alotrojah_lang', 'de');
    lang.init();
    expect(lang.current()).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('init applies the stored language to the document', () => {
    sessionStorage.setItem('alotrojah_lang', 'en');
    lang.init();
    expect(lang.current()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('restores the stored language', () => {
    sessionStorage.setItem('alotrojah_lang', 'en');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        provideNgCryptoStore({ storageType: 'sessionStorage' }),
      ],
    });
    const fresh = TestBed.inject(LanguageService);
    expect(fresh.current()).toBe('en');
  });
});
