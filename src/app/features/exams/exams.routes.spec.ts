import { EXAMS_ROUTES } from './exams.routes';
import { RESULTS_ROUTES } from '../results/results.routes';

const roleData = (path: string): string[] =>
  (EXAMS_ROUTES.find((r) => r.path === path)?.data?.['roles'] ?? []) as string[];

describe('student result/exam routes (§C3)', () => {
  it('admits students to the exams list and detail, never to creation', () => {
    expect(roleData('')).toContain('student');
    expect(roleData(':id')).toContain('student');
    expect(roleData('new')).not.toContain('student');
  });

  it('admits students to term results, not to the season editor', () => {
    const term = RESULTS_ROUTES.find((r) => r.path === 'term');
    const season = RESULTS_ROUTES.find((r) => r.path === 'season');
    expect((term?.data?.['roles'] ?? []) as string[]).toContain('student');
    expect((season?.data?.['roles'] ?? []) as string[]).not.toContain('student');
  });
});
