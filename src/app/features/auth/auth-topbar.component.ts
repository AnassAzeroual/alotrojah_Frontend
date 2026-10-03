import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../core/i18n/language.service';
import { ThemeService } from '../../core/theme/theme.service';

/** Floating lang pills + theme toggle for auth pages. */
@Component({
  selector: 'app-auth-topbar',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-topbar">
      <div class="lang-pills" role="group" [attr.aria-label]="'auth.language' | translate">
        @for (l of lang.langs; track l) {
          <button
            type="button"
            [class.on]="lang.current() === l"
            [attr.aria-pressed]="lang.current() === l"
            (click)="lang.use(l)"
          >
            {{ l.toUpperCase() }}
          </button>
        }
      </div>
      <button
        type="button"
        class="auth-theme-btn"
        (click)="theme.toggle()"
        [attr.aria-label]="'nav.theme' | translate"
        [attr.title]="'nav.theme' | translate"
      >
        @if (isDark()) {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            />
          </svg>
        } @else {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        }
      </button>
    </div>
  `,
})
export class AuthTopbarComponent {
  readonly theme = inject(ThemeService);
  readonly lang = inject(LanguageService);
  readonly isDark = computed(() => this.theme.mode() === 'dark');
}
