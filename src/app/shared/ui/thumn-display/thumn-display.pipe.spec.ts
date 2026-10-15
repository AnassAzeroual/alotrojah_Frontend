import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
  TranslateService,
} from '@ngx-translate/core';
import { ThumnDisplayPipe } from './thumn-display.pipe';

describe('ThumnDisplayPipe', () => {
  let pipe: ThumnDisplayPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
      ],
    });
    const i18n = TestBed.inject(TranslateService);
    i18n.setTranslation('ar', {
      unit: { hizb_one: 'حزب', hizb_two: 'حزبان', hizb_few: 'أحزاب', hizb_other: 'حزب' },
    });
    i18n.use('ar');
    pipe = TestBed.runInInjectionContext(() => new ThumnDisplayPipe());
  });

  it('keeps sub-8 counts as bare thumn numbers', () => {
    expect(pipe.transform(4, 'ar')).toBe('4');
    expect(pipe.transform(3.75, 'ar')).toBe('3.75');
    expect(pipe.transform(null, 'ar')).toBe('—');
  });

  it('renders 8 thumn as 1 hizb with Arabic plurals above', () => {
    expect(pipe.transform(8, 'ar')).toBe('1 حزب');
    expect(pipe.transform(16, 'ar')).toBe('2 حزبان');
    expect(pipe.transform(24, 'ar')).toBe('3 أحزاب');
    expect(pipe.transform(88, 'ar')).toBe('11 حزب');
    expect(pipe.transform(9, 'ar')).toBe('1.13 حزب');
  });
});
