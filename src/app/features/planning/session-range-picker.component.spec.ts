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
    input: HTMLInputElement;
  } => {
    const fixture = TestBed.createComponent(SessionRangePickerComponent);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('testId', 'demo-range');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    return {
      fixture,
      cmp: fixture.componentInstance,
      input: el.querySelector<HTMLInputElement>('[data-testid="demo-range"]')!,
    };
  };

  /** Drive the private flatpickr the way UI clicks do (triggered onChange). */
  const pick = (cmp: SessionRangePickerComponent, start: Date, end?: Date): void => {
    const fp = (
      cmp as unknown as {
        fp: { setDate(d: Date | Date[], trigger: boolean): void; close(): void };
      }
    ).fp;
    fp.setDate(end === undefined ? start : [start, end], true);
  };

  const close = (cmp: SessionRangePickerComponent): void => {
    (cmp as unknown as { fp: { close(): void } }).fp.close();
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

  it('paints the committed pair with a bidi-safe separator', () => {
    const { input } = mount({ start: '2026-10-06T08:00', end: '2026-10-06T09:30' });
    expect(input.value).toBe('06/10/2026 08:00 → 06/10/2026 09:30');
  });

  it('shows an empty box for null', () => {
    const { input } = mount(null);
    expect(input.value).toBe('');
  });

  it('ignores a half-picked range and reverts it on close', () => {
    const { fixture, cmp, input } = mount({
      start: '2026-10-06T08:00',
      end: '2026-10-06T09:30',
    });
    pick(cmp, new Date(2026, 9, 7, 10, 0));
    fixture.detectChanges();
    expect(cmp.value()).toEqual({ start: '2026-10-06T08:00', end: '2026-10-06T09:30' });
    close(cmp);
    fixture.detectChanges();
    expect(input.value).toBe('06/10/2026 08:00 → 06/10/2026 09:30');
  });

  it('commits a completed range pick as local ISO datetimes', () => {
    const { fixture, cmp } = mount(null);
    pick(cmp, new Date(2026, 9, 7, 10, 0), new Date(2026, 9, 7, 11, 30));
    fixture.detectChanges();
    expect(cmp.value()).toEqual({ start: '2026-10-07T10:00', end: '2026-10-07T11:30' });
  });

  it('keeps an evening pick up to the 23:59 cap', () => {
    const { fixture, cmp } = mount(null);
    pick(cmp, new Date(2026, 9, 7, 21, 0), new Date(2026, 9, 7, 23, 30));
    fixture.detectChanges();
    expect(cmp.value()).toEqual({ start: '2026-10-07T21:00', end: '2026-10-07T23:30' });
  });

  it('does not recommit the identical pair', () => {
    const { fixture, cmp } = mount({
      start: '2026-10-06T08:00',
      end: '2026-10-06T09:30',
    });
    const before = cmp.value();
    pick(cmp, new Date(2026, 9, 6, 8, 0), new Date(2026, 9, 6, 9, 30));
    fixture.detectChanges();
    expect(cmp.value()).toBe(before);
  });
});
