import { Role } from '../api/models';

export interface NavItem {
  /** Where the link points. */
  path: string;
  /**
   * URL prefix that should light this item up. Defaults to {@link path}.
   * Set it when the item owns a whole subtree (e.g. `/results/term` must stay
   * active on `/results/season`) or when a sibling item is a child route
   * (`/planning` vs `/planning/calendar`): the LONGEST matching prefix wins,
   * so exactly one item is ever active.
   */
  match?: string;
  key: string;
  icon: string;
  roles: readonly Role[];
  testId: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
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
    // Owns seasons/terms/plans, but /planning/calendar is a sibling item.
    match: '/planning',
    key: 'nav.planning',
    icon: 'calendar',
    roles: ['admin', 'supervisor'],
    testId: 'nav-planning',
  },
  {
    path: '/planning/calendar',
    key: 'nav.calendar',
    icon: 'calendar',
    roles: ['admin', 'supervisor', 'teacher', 'student', 'board'],
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
    // Students have no exam-start workflow; the page is staff-only.
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
    // One nav item covers both the term and the season view.
    match: '/results',
    key: 'nav.results',
    icon: 'award',
    roles: ['admin', 'supervisor', 'teacher', 'student'],
    testId: 'nav-results',
  },
  {
    path: '/reports/term',
    match: '/reports',
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

/**
 * The single nav item that owns `url`, or `null` when the URL belongs to none
 * (e.g. `/settings`, which lives outside the item list). Segment-aware: the
 * prefix must end at a `/` boundary, so `/planningx` never matches `/planning`.
 */
export function resolveActiveNav<T extends Pick<NavItem, 'path' | 'match'>>(
  items: readonly T[],
  url: string,
): T | null {
  const clean = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  let best: T | null = null;
  let bestLen = -1;
  for (const item of items) {
    const prefix = item.match ?? item.path;
    const hit = prefix === '/' ? clean === '/' : clean === prefix || clean.startsWith(`${prefix}/`);
    if (hit && prefix.length > bestLen) {
      best = item;
      bestLen = prefix.length;
    }
  }
  return best;
}
