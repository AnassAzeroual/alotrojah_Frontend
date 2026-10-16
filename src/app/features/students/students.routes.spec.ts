import { STUDENTS_ROUTES } from './students.routes';

const roleData = (path: string): string[] =>
  (STUDENTS_ROUTES.find((r) => r.path === path)?.data?.['roles'] ?? []) as string[];

describe('student routes (pupils never create pupils)', () => {
  it('admits students to the list and their own detail, never to creation', () => {
    expect(roleData('')).toContain('student');
    expect(roleData(':id')).toContain('student');
    expect(roleData('new')).not.toContain('student');
  });
});
