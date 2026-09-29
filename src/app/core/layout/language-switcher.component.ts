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
        <option [value]="l">{{ label(l) }}</option>
      }
    </select>
  `,
  styles: [
    `
      select {
        padding: var(--space-2);
        border-radius: var(--radius-sm);
        border: 1px solid #cfd6d2;
        background: var(--color-surface);
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
