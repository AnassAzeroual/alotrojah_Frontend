import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';
import { dirtyGuard } from '../../core/guards/dirty.guard';

const MANAGER: ('admin' | 'supervisor')[] = ['admin', 'supervisor'];

export const PLANNING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./seasons-list.page').then((m) => m.SeasonsListPage),
    canActivate: [roleGuard],
    data: { roles: MANAGER },
  },
  {
    path: 'new',
    loadComponent: () => import('./season-create.page').then((m) => m.SeasonCreatePage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: MANAGER },
  },
  {
    // Experimental season calendar: all seasons/terms/weeks/sessions on
    // month/week/day views. The legacy pages stay untouched.
    path: 'calendar',
    loadComponent: () => import('./seasons-calendar.page').then((m) => m.SeasonsCalendarPage),
    canActivate: [roleGuard],
    data: { roles: MANAGER },
  },
  {
    // Full edit form (name/dates/hijri only — terms/sessions are generated
    // once and immutable afterwards, or recorded facts would orphan).
    path: ':id/edit',
    loadComponent: () => import('./season-create.page').then((m) => m.SeasonCreatePage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: MANAGER },
  },
  {
    path: 'terms/:id',
    loadComponent: () => import('./term-detail.page').then((m) => m.TermDetailPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: MANAGER },
  },
  {
    path: 'plans',
    loadComponent: () => import('./plans.page').then((m) => m.PlansPage),
    canActivate: [roleGuard],
    canDeactivate: [dirtyGuard],
    data: { roles: MANAGER },
  },
];
