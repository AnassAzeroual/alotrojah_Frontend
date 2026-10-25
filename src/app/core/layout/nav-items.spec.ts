import { NAV_ITEMS, resolveActiveNav } from './nav-items';

const active = (url: string): string | null => resolveActiveNav(NAV_ITEMS, url)?.path ?? null;

describe('resolveActiveNav', () => {
  it('lights the dashboard only on the root URL', () => {
    expect(active('/')).toBe('/');
    expect(active('/?tab=2')).toBe('/');
    expect(active('/students')).toBe('/students');
  });

  it('keeps Planning active on every nested planning route', () => {
    expect(active('/planning')).toBe('/planning');
    expect(active('/planning/terms/7')).toBe('/planning');
    expect(active('/planning/plans')).toBe('/planning');
    expect(active('/planning/new')).toBe('/planning');
    expect(active('/planning/3/edit')).toBe('/planning');
  });

  it('gives the calendar its own item, not Planning', () => {
    expect(active('/planning/calendar')).toBe('/planning/calendar');
    expect(active('/planning/calendar?view=week')).toBe('/planning/calendar');
  });

  it('keeps Results and Reports active on their season views', () => {
    expect(active('/results/term')).toBe('/results/term');
    expect(active('/results/season')).toBe('/results/term');
    expect(active('/reports/term')).toBe('/reports/term');
    expect(active('/reports/season')).toBe('/reports/term');
  });

  it('matches nested detail routes of single-item sections', () => {
    expect(active('/students/12')).toBe('/students');
    expect(active('/groups/4/edit')).toBe('/groups');
    expect(active('/exams/9')).toBe('/exams');
    expect(active('/users/3/replace')).toBe('/users');
    expect(active('/delegate/redeem')).toBe('/delegate');
  });

  it('is segment-aware and returns null outside the nav', () => {
    expect(active('/planningx')).toBeNull();
    expect(active('/settings')).toBeNull();
    expect(active('/settings/appearance')).toBeNull();
  });

  it('ignores trailing slashes and fragments', () => {
    expect(active('/planning/')).toBe('/planning');
    expect(active('/results/term#top')).toBe('/results/term');
  });

  it('keeps the exams item out of the student menu', () => {
    const exams = NAV_ITEMS.find((i) => i.path === '/exams')!;
    expect(exams.roles).toEqual(['admin', 'supervisor', 'teacher']);
    expect(NAV_ITEMS.filter((i) => i.roles.includes('student')).map((i) => i.path)).not.toContain(
      '/exams',
    );
  });
});
