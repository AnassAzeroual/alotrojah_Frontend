import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import { Arabic } from 'flatpickr/dist/l10n/ar';
import { French } from 'flatpickr/dist/l10n/fr';
import { LanguageService } from '../../../core/i18n/language.service';

/** ISO yyyy-mm-dd <-> display dd/mm/yyyy (API contract stays ISO). */
export function isoToDMY(v: string | null | undefined): string {
  if (!v) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** Strict real-date parse; null when the text is not a calendar date. */
export function dmyToISO(v: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v.trim());
  if (!m) return null;
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${y}-${p(mo)}-${p(d)}`;
}

const toDate = (iso: string | null): Date | null =>
  iso ? new Date(`${iso.slice(0, 10)}T00:00:00`) : null;

/**
 * Themed date picker. Display is ALWAYS dd/mm/yyyy (native date inputs
 * follow the browser/OS locale and cannot be forced); the model stays ISO
 * yyyy-mm-dd. Two binding modes, same as app-dropdown:
 * - signal mode: [value] + (valueChange)
 * - reactive mode: [formControl] / formControlName via ControlValueAccessor
 */
@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      #dateInput
      type="text"
      inputmode="numeric"
      dir="ltr"
      autocomplete="off"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [attr.data-testid]="testId() || null"
      [attr.aria-label]="ariaLabel() || (ariaLabelKey() | translate)"
      (input)="onTextInput($any($event.target).value)"
      (change)="onTextBlur($any($event.target).value)"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor, OnDestroy {
  readonly value = model<string | null>(null);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly placeholder = input('dd/mm/yyyy');
  readonly ariaLabel = input<string>('');
  readonly ariaLabelKey = input<string>('');
  readonly disabled = input(false);
  /** Stable hook for e2e (the visible input keeps the native control's testid). */
  readonly testId = input('');

  private readonly box = viewChild<ElementRef<HTMLInputElement>>('dateInput');
  private readonly language = inject(LanguageService);

  private fp: flatpickr.Instance | null = null;
  private readonly cva = signal(false);
  private readonly inner = signal<string | null>(null);
  private readonly cvaDisabled = signal(false);
  private onChange: (v: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  /**
   * Last value pushed outward (or painted). The mirror effect below only
   * repaints when the model moves WITHOUT us — comparing raw DOM text
   * instead would clobber mid-typing (uncommitted text legitimately differs
   * from the model until blur/pick commits it).
   */
  private lastOut: string | null | undefined = undefined;

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private current = (): string | null => (this.cva() ? this.inner() : this.value());

  constructor() {
    // Language switch rebuilds the calendar (month/day names + first weekday).
    effect(() => {
      this.language.current();
      if (this.fp) this.build();
    });
    // Signal-mode parents may set the value after init (e.g. loaded data):
    // mirror it into the calendar only when the model moved without us.
    effect(() => {
      const v = this.value();
      const ref = this.box();
      if (this.cva() || !this.fp || !ref || v === this.lastOut) return;
      this.syncCalendar(v);
      ref.nativeElement.value = isoToDMY(v);
      this.lastOut = v;
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
    el.value = isoToDMY(this.current());
    this.fp = flatpickr(el, {
      dateFormat: 'd/m/Y',
      defaultDate: toDate(this.current()) ?? undefined,
      minDate: toDate(this.min()) ?? undefined,
      maxDate: toDate(this.max()) ?? undefined,
      locale: lang === 'ar' ? Arabic : lang === 'fr' ? French : undefined,
      allowInput: true,
      onChange: (_sel, str) => this.commit(dmyToISO(str)),
      onClose: (_sel, str) => {
        // Typed garbage never sticks: revert to the last committed value.
        if (str !== '' && dmyToISO(str) === null) el.value = isoToDMY(this.current());
        this.onTouched();
      },
    });
    if (this.isDisabled()) el.disabled = true;
    this.lastOut = this.current();
  }

  private commit(v: string | null): void {
    this.onTouched();
    // Native change-event semantics: no commit when nothing changed (avoids
    // redundant PATCHes from re-picking the same date).
    if (v === this.current()) return;
    this.lastOut = v;
    if (this.cva()) {
      this.inner.set(v);
      this.onChange(v);
    } else {
      // ModelSignal.set() notifies (valueChange) subscribers by itself.
      this.value.set(v);
    }
  }

  /**
   * Typed text commits live (native date inputs commit per keystroke through
   * (input), and e2e fill() never blurs before clicking save — without this
   * the save button stays disabled and the suite deadlocks). Invalid partial
   * text is ignored here; it reverts on blur/close instead.
   */
  protected onTextInput(text: string): void {
    const iso = dmyToISO(text);
    if (iso !== null) this.commit(iso);
  }

  /** Blur: empty clears, garbage reverts to the committed value. */
  protected onTextBlur(text: string): void {
    if (text.trim() === '') {
      this.commit(null);
      return;
    }
    const iso = dmyToISO(text);
    if (iso === null) {
      const ref = this.box();
      if (ref) ref.nativeElement.value = isoToDMY(this.current());
    } else {
      this.commit(iso);
    }
  }

  private syncCalendar(v: string | null): void {
    if (!this.fp) return;
    const d = toDate(v);
    if (d) this.fp.setDate(d, false);
    else this.fp.clear(false);
  }

  writeValue(v: string | null): void {
    this.cva.set(true);
    this.inner.set(v);
    this.lastOut = v;
    this.syncCalendar(v);
    const ref = this.box();
    if (ref) ref.nativeElement.value = isoToDMY(v);
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
    const ref = this.box();
    if (ref) ref.nativeElement.disabled = disabled;
    if (disabled) this.fp?.close();
  }
}
