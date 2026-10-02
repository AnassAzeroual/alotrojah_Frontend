import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService, AppLang } from '../i18n/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <select
      [value]="lang.current()"
      (change)="onChange($event)"
      [attr.aria-label]="'auth.language'"
    >
      @for (l of lang.langs; track l) {
        <option [value]="l" [selected]="lang.current() === l">{{ label(l) }}</option>
      }
    </select>
  `,
  styles: [
    `
      select {
        height: 40px;
        padding: 0 var(--space-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text);
        font: inherit;
        font-size: var(--text-sm);
        font-weight: 600;
        cursor: pointer;
      }

      select:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 1px;
      }
    `,
  ],
})
export class LanguageSwitcherComponent {
  readonly lang = inject(LanguageService);

  protected label(l: AppLang): string {
    return l === 'ar' ? 'العربية' : l === 'fr' ? 'Français' : 'English';
  }

  protected onChange(event: Event): void {
    this.lang.use((event.target as HTMLSelectElement).value as AppLang);
  }
}
