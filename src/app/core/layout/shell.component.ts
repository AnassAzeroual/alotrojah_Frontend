import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { RegistrationRequestsService } from '../api/registration-requests.service';
import { LanguageService } from '../i18n/language.service';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { AdminPrefsService } from '../settings/admin-prefs.service';
import { AppearanceService } from '../settings/appearance.service';
import { ThemeService } from '../theme/theme.service';
import { APP_VERSION_SHORT } from '../version';
import { NAV_ITEMS, resolveActiveNav } from './nav-items';
import { SetupGuideService } from '../settings/setup-guide.service';
import { SetupGuideComponent } from './setup-guide/setup-guide.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LanguageSwitcherComponent,
    SetupGuideComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  host: { '(document:keydown.escape)': 'onEscape()' },
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  readonly theme = inject(ThemeService);

  readonly user = this.auth.currentUser;
  readonly version = APP_VERSION_SHORT;
  readonly prefs = inject(AdminPrefsService);
  readonly appearance = inject(AppearanceService);
  readonly guide = inject(SetupGuideService);
  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  private readonly menuBtn = viewChild<ElementRef<HTMLButtonElement>>('menuBtn');
  private readonly sidebarEl = viewChild<ElementRef<HTMLElement>>('sidebarEl');
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

  /** Phone variant of {@link gregorian}: numeric day/month keeps the chip narrow. */
  readonly gregorianShort = computed(() => {
    const d = this.now();
    const date = d.toLocaleString('en-GB', { day: '2-digit', month: '2-digit' });
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

  /** Phone variant of {@link hijri}: day/month/year digits only, no weekday. */
  readonly hijriShort = computed(() => {
    const lang = this.language.current();
    const locale = `${lang}-u-ca-islamic-umalqura`;
    try {
      const d = new Date(this.now());
      d.setDate(d.getDate() + this.hijriOffsetDays);
      return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }).format(d);
    } catch {
      return '';
    }
  });

  readonly items = computed(() => {
    const role = this.user()?.role;
    return NAV_ITEMS.filter((i) => role !== undefined && i.roles.includes(role));
  });

  private readonly regSvc = inject(RegistrationRequestsService);
  private readonly router = inject(Router);
  private readonly regTick = signal(0);

  /** Current URL, kept in sync by the NavigationEnd subscription below. */
  private readonly currentUrl = signal(this.router.url);

  /** The one nav item that owns the current URL (longest prefix wins). */
  readonly activeNav = computed(
    () => resolveActiveNav(this.items(), this.currentUrl())?.path ?? null,
  );

  /** Pending waiting-room count for the header bell badge (admin only). */
  readonly pendingRegistrations = resource({
    params: () => ({ admin: this.user()?.role === 'admin', t: this.regTick() }),
    loader: async ({ params }) => {
      if (!params.admin) return 0;
      const p = await firstValueFrom(this.regSvc.list({ per_page: 1 }));
      return p.meta.total;
    },
  });

  /** Bell click: land on the waiting room when something is actually waiting. */
  openRegistrations(): void {
    if ((this.pendingRegistrations.value() ?? 0) > 0) {
      void this.router.navigate(['/registrations']);
    }
  }

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
    this.appearance.load();
    // First-run checklist: one auto-open per account while setup is incomplete.
    if (this.user()?.role === 'admin') this.guide.maybeAutoOpen();
    // Tablet (768–1023): start with the rail — an expanded 268px sidebar
    // leaves the topbar ~500px, which the date chips + identity cannot fit.
    if (window.matchMedia?.('(min-width: 768px) and (max-width: 1023px)')?.matches) {
      this.collapsed.set(true);
    }
    const timer = setInterval(() => this.now.set(new Date()), 30_000);
    const destroy = inject(DestroyRef);
    destroy.onDestroy(() => clearInterval(timer));
    const nav = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl.set(e.urlAfterRedirects);
        this.regTick.update((n) => n + 1);
      });
    destroy.onDestroy(() => nav.unsubscribe());
  }

  toggleSidebar(): void {
    this.collapsed.update((v) => !v);
  }

  openMobile(): void {
    this.mobileOpen.set(true);
    // Focus once the open class has cleared the closed state's
    // visibility:hidden — focusing earlier silently fails, and Tab would
    // stay on the topbar controls behind the scrim.
    const focusDrawer = (tries: number): void => {
      const el = this.sidebarEl()?.nativeElement;
      if (el && getComputedStyle(el).visibility === 'visible') {
        el.focus({ preventScroll: true });
      } else if (tries > 0) {
        requestAnimationFrame(() => focusDrawer(tries - 1));
      }
    };
    requestAnimationFrame(() => focusDrawer(5));
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  /** Esc / scrim dismissal: close and hand focus back to the menu button. */
  closeMobileToMenu(): void {
    if (!this.mobileOpen()) return;
    this.mobileOpen.set(false);
    this.menuBtn()?.nativeElement.focus({ preventScroll: true });
  }

  onEscape(): void {
    if (this.guide.open()) {
      this.guide.hide();
      return;
    }
    this.closeMobileToMenu();
  }

  logout(): void {
    this.auth.logout();
  }
}
