import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import { flatpickrLocale } from '../../shared/ui/date-picker/flatpickr-locale';
import { LanguageService } from '../../core/i18n/language.service';
import { dateToClockTime, dateToISODate, clampClock, MAX_CLOCK } from './seasons-calendar.helpers';

/** Range value: local ISO datetimes `yyyy-MM-ddTHH:mm` (no seconds, no zone). */
export interface DateTimeRange {
  start: string;
  end: string;
}

export function toLocalISO(d: Date): string {
  return `${dateToISODate(d)}T${dateToClockTime(d)}`;
}

function parseLocalISO(v: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v);
  if (!m) return null;
  const dt = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function sameRange(a: DateTimeRange | null, b: DateTimeRange | null | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.start === b.start && a.end === b.end;
}

/** Clamp a leg to the day ceiling (typed text can slip past maxTime). */
function clampISO(v: string): string {
  return `${v.slice(0, 11)}${clampClock(v.slice(11, 16))}`;
}

/**
 * Touch-first devices get a tap-only field (no soft keyboard covering the
 * calendar); desktops keep typed entry. jsdom has no matchMedia — allow
 * input there so unit tests and desktop e2e keep exercising the text path.
 */
function allowTypedEntry(): boolean {
  return typeof window.matchMedia !== 'function' || window.matchMedia('(hover: hover)').matches;
}

function displayLeg(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * Session start→end editor for the calendar detail card (managers only).
 * Two single-date flatpickrs — one leg for start, one for end — each with
 * 24h time, so a pick commits that leg immediately. The retired range-mode
 * single field needed two clicks and re-anchored a pre-selected range in
 * confusing ways (it read as "always rewriting the end"); two pickers remove
 * that ambiguity: changing the start can never touch the end and vice versa.
 */
@Component({
  selector: 'app-session-range-picker',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="range-pair" role="group" [attr.aria-label]="ariaLabelKey() | translate">
      <label class="range-leg">
        <span class="range-label">{{ startLabelKey() | translate }}</span>
        <span class="range-ctrl">
          <input
            #startInput
            type="text"
            inputmode="numeric"
            dir="ltr"
            autocomplete="off"
            [placeholder]="startPlaceholder()"
            [attr.data-testid]="testId() || null"
          />
          <svg
            class="range-ico"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </span>
      </label>
      <span class="range-arrow" dir="ltr" aria-hidden="true">→</span>
      <label class="range-leg">
        <span class="range-label">{{ endLabelKey() | translate }}</span>
        <span class="range-ctrl">
          <input
            #endInput
            type="text"
            inputmode="numeric"
            dir="ltr"
            autocomplete="off"
            [placeholder]="endPlaceholder()"
            [attr.data-testid]="testId() ? testId() + '-end' : null"
          />
          <svg
            class="range-ico"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </span>
      </label>
    </div>
  `,
})
export class SessionRangePickerComponent implements AfterViewInit, OnDestroy {
  readonly value = model<DateTimeRange | null>(null);
  readonly startPlaceholder = input('dd/mm/yyyy HH:mm');
  readonly endPlaceholder = input('dd/mm/yyyy HH:mm');
  readonly startLabelKey = input('cal.start');
  readonly endLabelKey = input('cal.end');
  readonly ariaLabelKey = input('cal.datetime_range');
  /** Stable hook for e2e: the start leg keeps the bare testid (`cal-date-<id>`),
   *  the end leg suffixes `-end` (`cal-date-<id>-end`). */
  readonly testId = input('');

  private readonly startBox = viewChild<ElementRef<HTMLInputElement>>('startInput');
  private readonly endBox = viewChild<ElementRef<HTMLInputElement>>('endInput');
  private readonly language = inject(LanguageService);

  private fpStart: flatpickr.Instance | null = null;
  private fpEnd: flatpickr.Instance | null = null;
  private lastOut: DateTimeRange | null | undefined = undefined;

  constructor() {
    // Language switch rebuilds the calendars (labels + month/weekday names).
    effect(() => {
      this.language.current();
      if (this.fpStart) this.build();
    });
    // Parents push a new pair when another session is selected: mirror it
    // into the calendars only when the model moved without us.
    effect(() => {
      const v = this.value();
      if (!this.fpStart || sameRange(v, this.lastOut)) return;
      this.paint(v);
    });
  }

  ngAfterViewInit(): void {
    this.build();
  }

  ngOnDestroy(): void {
    this.fpStart?.destroy();
    this.fpStart = null;
    this.fpEnd?.destroy();
    this.fpEnd = null;
  }

  private build(): void {
    const s = this.startBox();
    const e = this.endBox();
    if (!s || !e) return;
    this.fpStart?.destroy();
    this.fpEnd?.destroy();
    const lang = this.language.current();
    const locale = {
      ...flatpickrLocale(lang),
    };
    const leg = (input: HTMLInputElement, onPick: (d: Date) => void): flatpickr.Instance =>
      flatpickr(input, {
        mode: 'single',
        enableTime: true,
        time_24hr: true,
        // Full 24h day, like the week/day views render (no clock past 23:59).
        maxTime: MAX_CLOCK,
        dateFormat: 'd/m/Y H:i',
        // flatpickr merges a partial object over its English defaults, so the
        // month/day names stay localized.
        locale,
        allowInput: allowTypedEntry(),
        // Date+time has no usable native fallback: force the custom calendar
        // on touch devices too (same trade as the retired range picker).
        disableMobile: true,
        onChange: (sel) => {
          if (sel.length !== 1) return;
          onPick(sel[0]);
        },
        // Incomplete picks (or typed garbage) never stick: revert the display.
        onClose: () => this.paint(this.value()),
      });
    this.fpStart = leg(s.nativeElement, (d) => {
      const cur = this.value();
      if (!cur) return;
      this.commit({ ...cur, start: clampISO(toLocalISO(d)) });
    });
    this.fpEnd = leg(e.nativeElement, (d) => {
      const cur = this.value();
      if (!cur) return;
      this.commit({ ...cur, end: clampISO(toLocalISO(d)) });
    });
    this.paint(this.value());
  }

  private commit(v: DateTimeRange): void {
    // Native change-event semantics: no commit when nothing changed (avoids
    // redundant PATCHes from re-picking the same value).
    if (sameRange(v, this.value())) return;
    this.lastOut = { ...v };
    this.value.set({ ...v });
  }

  private paint(v: DateTimeRange | null): void {
    const s = this.startBox();
    const e = this.endBox();
    if (!s || !e || !this.fpStart || !this.fpEnd) return;
    const sDate = v ? parseLocalISO(v.start) : undefined;
    const eDate = v ? parseLocalISO(v.end) : undefined;
    if (sDate) {
      this.fpStart.setDate(sDate, false);
      s.nativeElement.value = displayLeg(sDate);
    } else {
      this.fpStart.clear(false);
      s.nativeElement.value = '';
    }
    if (eDate) {
      this.fpEnd.setDate(eDate, false);
      e.nativeElement.value = displayLeg(eDate);
    } else {
      this.fpEnd.clear(false);
      e.nativeElement.value = '';
    }
    this.lastOut = v ? { ...v } : v;
  }
}
