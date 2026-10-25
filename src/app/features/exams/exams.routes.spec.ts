import { EXAMS_ROUTES } from './exams.routes';
import { RESULTS_ROUTES } from '../results/results.routes';

const roleData = (path: string): string[] =>
  (EXAMS_ROUTES.find((r) => r.path === path)?.data?.['roles'] ?? []) as string[];

describe('student result/exam routes (§C3)', () => {
  it('admits students to the exams builder/detail and redirects old /new', () => {
    expect(roleData('')).toContain('student');
    expect(roleData(':id')).toContain('student');
    expect(EXAMS_ROUTES.find((r) => r.path === 'new')).toMatchObject({
      redirectTo: '',
      pathMatch: 'full',
    });
  });

  it('keeps the weekly sheet staff-only', () => {
    expect(roleData('weekly')).not.toContain('student');
    expect(roleData('weekly')).toEqual(expect.arrayContaining(['admin', 'supervisor', 'teacher']));
  });

  it('admits students to term results, not to the season editor', () => {
    const term = RESULTS_ROUTES.find((r) => r.path === 'term');
    const season = RESULTS_ROUTES.find((r) => r.path === 'season');
    expect((term?.data?.['roles'] ?? []) as string[]).toContain('student');
    expect((season?.data?.['roles'] ?? []) as string[]).not.toContain('student');
  });
});
