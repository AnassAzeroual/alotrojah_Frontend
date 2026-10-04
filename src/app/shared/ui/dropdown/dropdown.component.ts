import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

/** Option value. Numbers stay numbers (e.g. numeric form controls). */
export type DropdownValue = string | number;

/** Template-callable helpers (String()/Number() don't exist in templates). */
export function dropdownText(v: DropdownValue | null | undefined): string {
  return v === null || v === undefined ? '' : String(v);
}

export function dropdownNumber(v: DropdownValue | null | undefined): number | null {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export interface DropdownOption {
  value: DropdownValue;
  /** Literal label (e.g. entity names). Takes precedence over labelKey. */
  label?: string;
  /** i18n key label, reactive via TranslatePipe. */
  labelKey?: string;
}

/**
 * Themed replacement for native <select>, same interaction pattern as the
 * language switcher. Two binding modes:
 * - signal mode: [value] + (valueChange) with string values ('"" = none)
 * - reactive mode: [formControl] / formControlName via ControlValueAccessor
 */
@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dd" [class.open]="open()" [class.compact]="compact()">
      <button
        type="button"
        class="dd-btn"
        [disabled]="isDisabled()"
        (click)="open.set(!open())"
        [attr.aria-label]="ariaLabel() || (ariaLabelKey() | translate)"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open()"
      >
        <span class="dd-label">
          @let sel = selected();
          @if (sel?.label) {
            {{ sel?.label }}
          } @else if (sel?.labelKey) {
            {{ sel?.labelKey | translate }}
          } @else if (placeholder()) {
            {{ placeholder() }}
          } @else {
            {{ placeholderKey() | translate }}
          }
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      @if (open()) {
        <div class="dd-backdrop" (click)="close()" aria-hidden="true"></div>
        <ul class="dd-list" role="listbox" (keydown.escape)="close()">
          @for (opt of options(); track opt.value) {
            <li role="option" [attr.aria-selected]="current() === opt.value">
              <button
                type="button"
                [class.on]="current() === opt.value"
                (click)="choose(opt.value)"
              >
                <span>
                  @if (opt.label) {
                    {{ opt.label }}
                  } @else {
                    {{ opt.labelKey | translate }}
                  }
                </span>
                @if (current() === opt.value) {
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                }
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .dd {
        position: relative;
        min-width: 0;
      }
      /* Lift the whole control above following cards/sections while open. */
      .dd.open {
        z-index: var(--z-dropdown);
      }
      .dd-btn {
        width: 100%;
        min-height: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-2);
        padding: 0 var(--space-3);
        border-radius: var(--radius-md);
        border: 1.5px solid var(--color-border-strong);
        background: var(--color-surface);
        color: var(--color-text);
        font: inherit;
        font-size: var(--text-sm);
        cursor: pointer;
        transition: border-color 160ms;
      }
      .dd.compact .dd-btn {
        min-height: 40px;
      }
      .dd-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dd-btn svg {
        width: 16px;
        height: 16px;
        flex: none;
        color: var(--color-muted);
        transition: transform 160ms;
      }
      .dd.open .dd-btn svg {
        transform: rotate(180deg);
      }
      .dd-btn:hover:not(:disabled) {
        border-color: var(--color-primary);
      }
      .dd-btn:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 1px;
      }
      .dd-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .dd-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1;
        cursor: default;
      }
      .dd-list {
        position: absolute;
        top: calc(100% + 8px);
        inset-inline-start: 0;
        z-index: 2;
        min-width: 100%;
        width: max-content;
        max-width: min(92vw, 340px);
        max-height: 280px;
        overflow-y: auto;
        margin: 0;
        padding: 6px;
        list-style: none;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-3);
        animation: dd-in 160ms cubic-bezier(0.22, 0.9, 0.28, 1) both;
      }
      @keyframes dd-in {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
      }
      .dd-list button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-2);
        padding: 10px 12px;
        border: 0;
        border-radius: var(--radius-md);
        background: transparent;
        color: var(--color-text);
        font: inherit;
        font-size: var(--text-sm);
        text-align: start;
        cursor: pointer;
      }
      .dd-list button:hover {
        background: color-mix(in srgb, var(--color-primary) 10%, transparent);
      }
      .dd-list button.on {
        color: var(--color-primary-dark);
        font-weight: 700;
      }
      [data-theme='dark'] .dd-list button.on {
        color: #5eead4;
      }
      .dd-list button span {
        min-width: 0;
        overflow-wrap: break-word;
      }
      .dd-list button svg {
        width: 16px;
        height: 16px;
        flex: none;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent implements ControlValueAccessor {
  readonly options = input.required<DropdownOption[]>();
  readonly value = input<DropdownValue | null>('');
  readonly valueChange = output<DropdownValue>();
  readonly placeholder = input<string>('');
  readonly placeholderKey = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly ariaLabelKey = input<string>('');
  readonly disabled = input(false);
  readonly compact = input(false);

  readonly open = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);

  /**
   * Click-away close. The fixed backdrop catches most outside clicks, but it
   * is clipped whenever an ancestor creates a containing block (transform /
   * filter / backdrop-filter) — the document listener always fires.
   */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node | null)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.close();
  }

  private readonly cva = signal(false);
  private readonly inner = signal<DropdownValue>('');
  private readonly cvaDisabled = signal(false);
  private onChange: (v: DropdownValue | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly current = computed(() => (this.cva() ? this.inner() : this.value()));
  protected readonly selected = computed(() =>
    this.options().find((o) => o.value === this.current()),
  );

  protected choose(v: DropdownValue): void {
    this.open.set(false);
    this.onTouched();
    if (this.cva()) {
      // Nullable form controls (e.g. number|null group ids) receive null
      // for the empty option; signal-mode consumers map '' themselves.
      this.inner.set(v);
      this.onChange(v === '' ? null : v);
    } else {
      this.valueChange.emit(v);
    }
  }

  protected close(): void {
    this.open.set(false);
    this.onTouched();
  }

  writeValue(v: DropdownValue | null): void {
    this.cva.set(true);
    this.inner.set(v ?? '');
  }

  registerOnChange(fn: (v: DropdownValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }
}
