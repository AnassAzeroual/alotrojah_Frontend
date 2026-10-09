import {
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
import { Arabic } from 'flatpickr/dist/l10n/ar';
import { French } from 'flatpickr/dist/l10n/fr';
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

function toDates(v: DateTimeRange | null): [Date, Date] | undefined {
  if (!v) return undefined;
  const s = parseLocalISO(v.start);
  const e = parseLocalISO(v.end);
  return s && e ? [s, e] : undefined;
}

function sameRange(a: DateTimeRange | null, b: DateTimeRange | null | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.start === b.start && a.end === b.end;
}

// Direction-neutral range separator: the whole line stays digits + Latin,
// so no bidi reordering inside the locked-LTR input (an Arabic separator
// visibly jumbles the two ends). Shared by the painted text, the flatpickr
// locale override (its own text must parse back), and typed input.
const RANGE_SEP = ' → ';

/**
 * Touch-first devices get a tap-only field (no soft keyboard covering the
 * calendar); desktops keep typed entry. jsdom has no matchMedia — allow
 * input there so unit tests and desktop e2e keep exercising the text path.
 */
function allowTypedEntry(): boolean {
  return typeof window.matchMedia !== 'function' || window.matchMedia('(hover: hover)').matches;
}

function displayRange(start: Date, end: Date, sep: string): string {
  const f = (d: Date): string => {
    const p = (n: number): string => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  return `${f(start)}${sep}${f(end)}`;
}

/**
 * Session start→end picker for the calendar detail card (managers only).
 * One flatpickr in range + 24h-time mode; the model is a {start, end} pair of
 * local ISO datetimes. A half-picked range never commits — the display snaps
 * back to the last committed pair on close.
 */
@Component({
  selector: 'app-session-range-picker',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      #rangeInput
      type="text"
      inputmode="numeric"
      dir="ltr"
      autocomplete="off"
      [placeholder]="placeholder()"
      [attr.data-testid]="testId() || null"
      [attr.aria-label]="ariaLabelKey() | translate"
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
  `,
})
export class SessionRangePickerComponent implements OnDestroy {
  readonly value = model<DateTimeRange | null>(null);
  readonly placeholder = input('dd/mm/yyyy HH:mm → dd/mm/yyyy HH:mm');
  readonly ariaLabelKey = input('cal.datetime_range');
  /** Stable hook for e2e (keeps the retired date-picker's testid shape). */
  readonly testId = input('');

  private readonly box = viewChild<ElementRef<HTMLInputElement>>('rangeInput');
  private readonly language = inject(LanguageService);

  private fp: flatpickr.Instance | null = null;
  private lastOut: DateTimeRange | null | undefined = undefined;

  constructor() {
    // Language switch rebuilds the calendar (labels + range separator).
    effect(() => {
      this.language.current();
      if (this.fp) this.build();
    });
    // Parents push a new pair when another session is selected: mirror it
    // into the calendar only when the model moved without us.
    effect(() => {
      const v = this.value();
      if (!this.fp || sameRange(v, this.lastOut)) return;
      this.paint(v);
    });
  }

  ngAfterViewInit(): void {
    this.build();
  }

  ngOnDestroy(): void {
    this.fp?.destroy();
    this.fp = null;
  }

  private build(): void {
    const ref = this.box();
    if (!ref) return;
    this.fp?.destroy();
    const el = ref.nativeElement;
    const lang = this.language.current();
    this.fp = flatpickr(el, {
      mode: 'range',
      enableTime: true,
      time_24hr: true,
      // Day ceiling 22:00 everywhere, like the week/day views render.
      maxTime: MAX_CLOCK,
      dateFormat: 'd/m/Y H:i',
      defaultDate: toDates(this.value()),
      // flatpickr merges a partial object over its English defaults, so the
      // month/day names stay localized while the separator stays bidi-safe.
      locale: {
        ...(lang === 'ar' ? Arabic : lang === 'fr' ? French : {}),
        rangeSeparator: RANGE_SEP,
      },
      allowInput: allowTypedEntry(),
      // Range + time has no usable native fallback: force the custom
      // calendar on touch devices too (single-date pickers may keep theirs).
      disableMobile: true,
      onChange: (sel) => {
        // Range picks land one click at a time — commit the completed pair only,
        // clamped to the day ceiling (typed text can slip past maxTime).
        if (sel.length !== 2) return;
        const start = toLocalISO(sel[0]);
        const end = toLocalISO(sel[1]);
        this.commit({
          start: start.slice(0, 11) + clampClock(start.slice(11, 16)),
          end: end.slice(0, 11) + clampClock(end.slice(11, 16)),
        });
      },
      onClose: () => {
        // Incomplete picks (or typed garbage) never stick: revert the display.
        if ((this.fp?.selectedDates.length ?? 0) !== 2) this.paint(this.value());
      },
    });
    this.paint(this.value());
  }

  private commit(v: DateTimeRange): void {
    // Native change-event semantics: no commit when nothing changed (avoids
    // redundant PATCHes from re-picking the same range).
    if (sameRange(v, this.value())) return;
    this.lastOut = { ...v };
    this.value.set({ ...v });
  }

  private paint(v: DateTimeRange | null): void {
    const ref = this.box();
    if (!ref || !this.fp) return;
    const dates = toDates(v);
    if (dates) {
      this.fp.setDate(dates, false);
      ref.nativeElement.value = displayRange(dates[0], dates[1], RANGE_SEP);
    } else {
      this.fp.clear(false);
      ref.nativeElement.value = '';
    }
    this.lastOut = v ? { ...v } : v;
  }
}
