import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LanguageService, AppLang } from '../i18n/language.service';
import { DropdownComponent, DropdownValue } from '../../shared/ui/dropdown/dropdown.component';

const LABELS: Record<AppLang, string> = { ar: 'العربية', fr: 'Français', en: 'English' };

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [DropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dropdown
      [compact]="true"
      [options]="options()"
      [value]="lang.current()"
      (valueChange)="choose($event)"
      ariaLabelKey="auth.language"
      testId="lang-switcher"
    />
  `,
})
export class LanguageSwitcherComponent {
  readonly lang = inject(LanguageService);

  protected readonly options = computed(() =>
    this.lang.langs.map((l) => ({ value: l, label: LABELS[l] })),
  );

  protected choose(v: DropdownValue): void {
    if (v === 'ar' || v === 'fr' || v === 'en') this.lang.use(v);
  }
}
