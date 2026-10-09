import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  resource,
  signal,
} from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { RegistrationRequestsService } from '../api/registration-requests.service';
import { LanguageService } from '../i18n/language.service';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { AdminPrefsService } from '../settings/admin-prefs.service';
import { ThemeService } from '../theme/theme.service';
import { Role } from '../api/api-models';
import { APP_VERSION_SHORT } from '../version';

interface NavItem {
  path: string;
  key: string;
  icon: string;
  roles: readonly Role[];
  testId: string;
  /** Match the URL exactly, so sibling routes don't also light up (e.g. /planning vs /planning/calendar). */
  exact?: boolean;
}

const ITEMS: readonly NavItem[] = [
  {
    path: '/',
    key: 'nav.dashboard',
    icon: 'home',
    roles: ['admin', 'supervisor', 'teacher', 'student', 'board'],
    testId: 'nav-dashboard',
    exact: true,
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
    exact: true,
  },
  {
    path: '/planning/calendar',
    key: 'nav.calendar',
    icon: 'calendar',
    roles: ['admin', 'supervisor'],
    testId: 'nav-calendar',
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
  readonly prefs = inject(AdminPrefsService);
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

  private readonly regSvc = inject(RegistrationRequestsService);
  private readonly router = inject(Router);
  private readonly regTick = signal(0);

  /** Pending waiting-room count for the red registrations badge (admin only). */
  readonly pendingRegistrations = resource({
    params: () => ({ admin: this.user()?.role === 'admin', t: this.regTick() }),
    loader: async ({ params }) => {
      if (!params.admin) return 0;
      const p = await firstValueFrom(this.regSvc.list({ per_page: 1 }));
      return p.meta.total;
    },
  });

  /**
   * T4: every non-admin sees their center NAME in the header chip; the numeric
   * id is appended whenever the display pref allows it — dev or prod, the
   * Settings checkbox is the only control. Admins are global — nothing extra.
   */
  readonly centerLabel = computed(() => {
    const u = this.user();
    if (!u || u.role === 'admin' || !u.center_name) return null;
    if (this.prefs.showCenterId() && u.center_id !== null) {
      return `${u.center_name} · #${u.center_id}`;
    }
    return u.center_name;
  });

  constructor() {
    const timer = setInterval(() => this.now.set(new Date()), 30_000);
    const destroy = inject(DestroyRef);
    destroy.onDestroy(() => clearInterval(timer));
    const nav = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.regTick.update((n) => n + 1));
    destroy.onDestroy(() => nav.unsubscribe());
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
