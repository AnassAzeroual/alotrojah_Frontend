import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateNoOpLoader } from '@ngx-translate/core';
import { LanguageService } from '../../core/i18n/language.service';
import {
  SessionRangePickerComponent,
  toLocalISO,
  type DateTimeRange,
} from './session-range-picker.component';

describe('session range ISO helpers', () => {
  it('formats local ISO datetimes without seconds or zone', () => {
    expect(toLocalISO(new Date(2026, 9, 6, 8, 5))).toBe('2026-10-06T08:05');
  });
});

describe('SessionRangePickerComponent', () => {
  const mount = (
    value: DateTimeRange | null,
  ): {
    fixture: ReturnType<typeof TestBed.createComponent<SessionRangePickerComponent>>;
    cmp: SessionRangePickerComponent;
    start: HTMLInputElement;
    end: HTMLInputElement;
  } => {
    const fixture = TestBed.createComponent(SessionRangePickerComponent);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('testId', 'demo-range');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    return {
      fixture,
      cmp: fixture.componentInstance,
      start: el.querySelector<HTMLInputElement>('[data-testid="demo-range"]')!,
      end: el.querySelector<HTMLInputElement>('[data-testid="demo-range-end"]')!,
    };
  };

  /** Drive a private flatpickr the way UI clicks do (triggered onChange). */
  const pick = (cmp: SessionRangePickerComponent, leg: 'start' | 'end', d: Date): void => {
    const fp = (cmp as unknown as Record<string, { setDate(date: Date, trigger: boolean): void }>)[
      leg === 'start' ? 'fpStart' : 'fpEnd'
    ];
    fp.setDate(d, true);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionRangePickerComponent],
      providers: [
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
        { provide: LanguageService, useValue: { current: signal('ar') } },
      ],
    }).compileComponents();
  });

  it('paints both legs from the committed pair', () => {
    const { start, end } = mount({ start: '2026-10-06T08:00', end: '2026-10-06T09:30' });
    expect(start.value).toBe('06/10/2026 08:00');
    expect(end.value).toBe('06/10/2026 09:30');
  });

  it('shows empty boxes for null', () => {
    const { start, end } = mount(null);
    expect(start.value).toBe('');
    expect(end.value).toBe('');
  });

  it('commits a start pick without touching the end', () => {
    const { fixture, cmp } = mount({ start: '2026-10-06T08:00', end: '2026-10-06T09:30' });
    pick(cmp, 'start', new Date(2026, 9, 7, 7, 45));
    fixture.detectChanges();
    expect(cmp.value()).toEqual({ start: '2026-10-07T07:45', end: '2026-10-06T09:30' });
  });

  it('commits an end pick without touching the start', () => {
    const { fixture, cmp } = mount({ start: '2026-10-06T08:00', end: '2026-10-06T09:30' });
    pick(cmp, 'end', new Date(2026, 9, 7, 11, 30));
    fixture.detectChanges();
    expect(cmp.value()).toEqual({ start: '2026-10-06T08:00', end: '2026-10-07T11:30' });
  });

  it('keeps an evening pick up to the 23:59 cap', () => {
    const { fixture, cmp } = mount({ start: '2026-10-06T21:00', end: '2026-10-06T22:30' });
    pick(cmp, 'end', new Date(2026, 9, 6, 23, 30));
    fixture.detectChanges();
    expect(cmp.value()).toEqual({ start: '2026-10-06T21:00', end: '2026-10-06T23:30' });
  });

  it('does not recommit an unchanged pick', () => {
    const { fixture, cmp } = mount({ start: '2026-10-06T08:00', end: '2026-10-06T09:30' });
    const before = cmp.value();
    pick(cmp, 'start', new Date(2026, 9, 6, 8, 0));
    fixture.detectChanges();
    expect(cmp.value()).toBe(before);
  });
});
