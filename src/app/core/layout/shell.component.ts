import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { Role } from '../api/api-models';

interface NavItem {
  path: string;
  key: string;
  roles: readonly Role[];
}

const ITEMS: readonly NavItem[] = [
  { path: '/', key: 'nav.dashboard', roles: ['admin', 'supervisor', 'teacher', 'guardian', 'student', 'board'] },
  { path: '/entry', key: 'nav.entry', roles: ['admin', 'supervisor', 'teacher'] },
  { path: '/students', key: 'nav.students', roles: ['admin', 'supervisor', 'teacher', 'guardian', 'student'] },
  { path: '/groups', key: 'nav.groups', roles: ['admin', 'supervisor', 'teacher'] },
  { path: '/guardians', key: 'nav.guardians', roles: ['admin', 'supervisor', 'teacher', 'guardian'] },
  { path: '/planning', key: 'nav.planning', roles: ['admin', 'supervisor'] },
  { path: '/scoring', key: 'nav.scoring', roles: ['admin', 'supervisor'] },
  { path: '/exams', key: 'nav.exams', roles: ['admin', 'supervisor', 'teacher'] },
  { path: '/reviews', key: 'nav.reviews', roles: ['admin', 'supervisor', 'teacher'] },
  { path: '/results/term', key: 'nav.results', roles: ['admin', 'supervisor', 'teacher'] },
  { path: '/reports/term', key: 'nav.reports', roles: ['admin', 'supervisor', 'teacher'] },
  { path: '/news', key: 'nav.news', roles: ['admin', 'supervisor', 'teacher', 'guardian', 'student', 'board'] },
  { path: '/delegate', key: 'nav.delegate', roles: ['admin', 'supervisor', 'teacher'] },
  { path: '/notifications', key: 'nav.notifications', roles: ['admin', 'supervisor', 'teacher'] },
  // F11+ append: account
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;
  readonly items = computed(() => {
    const role = this.user()?.role;
    return ITEMS.filter((i) => role !== undefined && i.roles.includes(role));
  });

  logout(): void {
    this.auth.logout();
  }
}
