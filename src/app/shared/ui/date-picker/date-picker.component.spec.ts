import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateNoOpLoader } from '@ngx-translate/core';
import { LanguageService } from '../../../core/i18n/language.service';
import { DatePickerComponent, dmyToISO, isoToDMY } from './date-picker.component';

describe('date ISO helpers', () => {
  it('converts ISO to day/month/year text', () => {
    expect(isoToDMY('2026-11-18')).toBe('18/11/2026');
    expect(isoToDMY(null)).toBe('');
  });

  it('parses real calendar dates strictly', () => {
    expect(dmyToISO('18/11/2026')).toBe('2026-11-18');
    expect(dmyToISO('31/02/2026')).toBeNull();
    expect(dmyToISO('2026-11-18')).toBeNull();
    expect(dmyToISO('garbage')).toBeNull();
  });
});

describe('DatePickerComponent', () => {
  const mount = (
    value: string | null,
  ): {
    fixture: ReturnType<typeof TestBed.createComponent<DatePickerComponent>>;
    cmp: DatePickerComponent;
    input: HTMLInputElement;
  } => {
    const fixture = TestBed.createComponent(DatePickerComponent);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('testId', 'demo-date');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    return {
      fixture,
      cmp: fixture.componentInstance,
      input: el.querySelector<HTMLInputElement>('[data-testid="demo-date"]')!,
    };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerComponent],
      providers: [
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        { provide: LanguageService, useValue: { current: signal('ar') } },
      ],
    }).compileComponents();
  });

  it('shows the committed value as dd/mm/yyyy on a stable testid', () => {
    const { input } = mount('2026-11-18');
    expect(input.type).toBe('text');
    expect(input.value).toBe('18/11/2026');
  });

  it('shows an empty box for null', () => {
    const { input } = mount(null);
    expect(input.value).toBe('');
  });

  it('does not clobber mid-typing with the committed value', () => {
    const { fixture, input } = mount('2026-10-06');
    expect(input.value).toBe('06/10/2026');
    // User types a new date but has not committed it yet (no blur/pick):
    // the mirror effect must leave the draft alone.
    input.value = '07/10/2026';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(input.value).toBe('07/10/2026');
  });

  it('commits a fully typed date live (no blur needed)', () => {
    const { fixture, cmp, input } = mount('2026-10-06');
    input.value = '07/10/2026';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(cmp.value()).toBe('2026-10-07');
  });
});
