import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { LanguageService } from '../i18n/language.service';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { ThemeService } from '../theme/theme.service';
import { Role } from '../api/api-models';
import { APP_VERSION_SHORT } from '../version';

interface NavItem {
  path: string;
  key: string;
  icon: string;
  roles: readonly Role[];
  testId: string;
}

const ITEMS: readonly NavItem[] = [
  {
    path: '/',
    key: 'nav.dashboard',
    icon: 'home',
    roles: ['admin', 'supervisor', 'teacher', 'student', 'board'],
    testId: 'nav-dashboard',
  },
  {
    path: '/centers',
    key: 'nav.centers',
    icon: 'building',
    roles: ['admin'],
    testId: 'nav-centers',
  },
  {
    path: '/levels',
    key: 'nav.levels',
    icon: 'grid',
    roles: ['admin'],
    testId: 'nav-levels',
  },
  {
    path: '/students',
    key: 'nav.students',
    icon: 'users',
    roles: ['admin', 'supervisor', 'teacher', 'student'],
    testId: 'nav-students',
  },
  {
    path: '/users',
    key: 'nav.users',
    icon: 'users',
    roles: ['admin', 'supervisor'],
    testId: 'nav-users',
  },
  {
    path: '/groups',
    key: 'nav.groups',
    icon: 'grid',
    roles: ['admin', 'supervisor', 'teacher'],
    testId: 'nav-groups',
  },
  {
    path: '/entry',
    key: 'nav.entry',
    icon: 'edit',
    roles: ['admin', 'supervisor', 'teacher'],
    testId: 'nav-entry',
  },
  {
    path: '/planning',
    key: 'nav.planning',
    icon: 'calendar',
    roles: ['admin', 'supervisor'],
    testId: 'nav-planning',
  },
  {
    path: '/scoring',
    key: 'nav.scoring',
    icon: 'chart',
    roles: ['admin'],
    testId: 'nav-scoring',
  },
  {
    path: '/exams',
    key: 'nav.exams',
    icon: 'file',
    roles: ['admin', 'supervisor', 'teacher'],
    testId: 'nav-exams',
  },
  {
    path: '/reviews',
    key: 'nav.reviews',
    icon: 'refresh',
    roles: ['admin', 'supervisor', 'teacher'],
    testId: 'nav-reviews',
  },
  {
    path: '/results/term',
    key: 'nav.results',
    icon: 'award',
    roles: ['admin', 'supervisor', 'teacher'],
    testId: 'nav-results',
  },
  {
    path: '/reports/term',
    key: 'nav.reports',
    icon: 'report',
    roles: ['admin', 'supervisor', 'teacher'],
    testId: 'nav-reports',
  },
  {
    path: '/news',
    key: 'nav.news',
    icon: 'bell',
    roles: ['admin', 'supervisor', 'teacher', 'student', 'board'],
    testId: 'nav-news',
  },
  {
    path: '/delegate',
    key: 'nav.delegate',
    icon: 'share',
    roles: ['admin', 'supervisor', 'teacher'],
    testId: 'nav-delegate',
  },
  {
    path: '/notifications',
    key: 'nav.notifications',
    icon: 'mail',
    roles: ['admin', 'supervisor', 'teacher'],
    testId: 'nav-notifications',
  },
  {
    path: '/registrations',
    key: 'nav.registrations',
    icon: 'shield',
    roles: ['admin'],
    testId: 'nav-registrations',
  },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LanguageSwitcherComponent,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  readonly theme = inject(ThemeService);

  readonly user = this.auth.currentUser;
  readonly version = APP_VERSION_SHORT;
  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly now = signal(new Date());
  readonly isDark = computed(() => this.theme.mode() === 'dark');

  /**
   * Morocco moon-sighting adjustment (days).
   * Intl's islamic-umalqura calendar is Saudi-calculated and can differ by ±1
   * day from the observed calendar announced by the Ministry of Habous and
   * Islamic Affairs. Set to -1 / +1 if the displayed date is off by a day.
   */
  private readonly hijriOffsetDays = 0;

  readonly gregorian = computed(() => {
    const d = this.now();
    const date = d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${date} - ${time}`;
  });

  readonly copiedDate = signal<'greg' | 'hijri' | null>(null);

  copyDate(text: string, which: 'greg' | 'hijri'): void {
    const done = (): void => {
      this.copiedDate.set(which);
      setTimeout(() => this.copiedDate.set(null), 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done, () => this.legacyCopy(text, done));
    } else {
      this.legacyCopy(text, done);
    }
  }

  private legacyCopy(text: string, done: () => void): void {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    } catch {
      // clipboard unavailable — ignore
    }
    done();
  }

  /** Hijri date via built-in Intl islamic-umalqura calendar (CLDR, offline, no API). */
  readonly hijri = computed(() => {
    const lang = this.language.current();
    const locale = `${lang}-u-ca-islamic-umalqura`;
    try {
      const d = new Date(this.now());
      d.setDate(d.getDate() + this.hijriOffsetDays);
      return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return '';
    }
  });

  readonly items = computed(() => {
    const role = this.user()?.role;
    return ITEMS.filter((i) => role !== undefined && i.roles.includes(role));
  });

  constructor() {
    const timer = setInterval(() => this.now.set(new Date()), 30_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  toggleSidebar(): void {
    this.collapsed.update((v) => !v);
  }
  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
