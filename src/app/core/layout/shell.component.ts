import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { ThemeService } from '../theme/theme.service';
import { Role } from '../api/api-models';
import { APP_VERSION_SHORT } from '../version';

interface NavItem {
  path: string;
  key: string;
  icon: string;
  roles: readonly Role[];
}

const ITEMS: readonly NavItem[] = [
  {
    path: '/',
    key: 'nav.dashboard',
    icon: 'home',
    roles: ['admin', 'supervisor', 'teacher', 'guardian', 'student', 'board'],
  },
  {
    path: '/students',
    key: 'nav.students',
    icon: 'users',
    roles: ['admin', 'supervisor', 'teacher', 'guardian', 'student'],
  },
  { path: '/groups', key: 'nav.groups', icon: 'grid', roles: ['admin', 'supervisor', 'teacher'] },
  {
    path: '/guardians',
    key: 'nav.guardians',
    icon: 'shield',
    roles: ['admin', 'supervisor', 'teacher', 'guardian'],
  },
  { path: '/entry', key: 'nav.entry', icon: 'edit', roles: ['admin', 'supervisor', 'teacher'] },
  { path: '/planning', key: 'nav.planning', icon: 'calendar', roles: ['admin', 'supervisor'] },
  { path: '/scoring', key: 'nav.scoring', icon: 'chart', roles: ['admin', 'supervisor'] },
  { path: '/exams', key: 'nav.exams', icon: 'file', roles: ['admin', 'supervisor', 'teacher'] },
  {
    path: '/reviews',
    key: 'nav.reviews',
    icon: 'refresh',
    roles: ['admin', 'supervisor', 'teacher'],
  },
  {
    path: '/results/term',
    key: 'nav.results',
    icon: 'award',
    roles: ['admin', 'supervisor', 'teacher'],
  },
  {
    path: '/reports/term',
    key: 'nav.reports',
    icon: 'report',
    roles: ['admin', 'supervisor', 'teacher'],
  },
  {
    path: '/news',
    key: 'nav.news',
    icon: 'bell',
    roles: ['admin', 'supervisor', 'teacher', 'guardian', 'student', 'board'],
  },
  {
    path: '/delegate',
    key: 'nav.delegate',
    icon: 'share',
    roles: ['admin', 'supervisor', 'teacher'],
  },
  {
    path: '/notifications',
    key: 'nav.notifications',
    icon: 'mail',
    roles: ['admin', 'supervisor', 'teacher'],
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
  readonly theme = inject(ThemeService);

  readonly user = this.auth.currentUser;
  readonly version = APP_VERSION_SHORT;
  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly now = signal(new Date());
  readonly isDark = computed(() => this.theme.mode() === 'dark');

  readonly items = computed(() => {
    const role = this.user()?.role;
    return ITEMS.filter((i) => role !== undefined && i.roles.includes(role));
  });

  constructor() {
    setInterval(() => this.now.set(new Date()), 30_000);
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
