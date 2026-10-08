import { dateToISODate, toCalendarEvent, type CalSession } from './seasons-calendar.helpers';

const SESSION: CalSession = {
  id: 19,
  planned_date: '2026-11-18',
  start_time: '08:00',
  end_time: '09:00',
  group_id: 4,
  session_type: 'memorization',
  status: 'planned',
  session_number_global: 19,
  term_id: 2,
  termName: 'الفصل الثاني',
  week_id: 7,
  weekNumber: 7,
  weekType: 'study',
};

describe('seasons-calendar helpers', () => {
  it('maps a session to a timed event with type and group in the title', () => {
    const e = toCalendarEvent(SESSION, 'حفظ', 'أ')!;
    expect(e.id).toBe(19);
    expect(e.title).toBe('#19 · حفظ · أ');
    expect(e.start).toEqual(new Date('2026-11-18T08:00'));
    expect(e.end).toEqual(new Date('2026-11-18T09:00'));
    expect(e.color?.primary).toBe('var(--green-600)');
    expect(e.color?.secondary).toBe('var(--color-mint)');
    expect(e.color?.secondaryText).toBe('var(--green-900)');
    expect(e.cssClass).toBe('st-memorization ss-planned');
  });

  it('omits the group from the title when the label is unknown', () => {
    const e = toCalendarEvent(SESSION, 'حفظ', null)!;
    expect(e.title).toBe('#19 · حفظ');
  });

  it('skips undated, untimed or group-less sessions (nothing to pin)', () => {
    expect(toCalendarEvent({ ...SESSION, planned_date: null }, 'حفظ', null)).toBeNull();
    expect(toCalendarEvent({ ...SESSION, start_time: null }, 'حفظ', null)).toBeNull();
    expect(toCalendarEvent({ ...SESSION, end_time: null }, 'حفظ', null)).toBeNull();
    expect(toCalendarEvent({ ...SESSION, group_id: null }, 'حفظ', null)).toBeNull();
  });

  it('keeps exam/revision events on their per-type card colors', () => {
    const exam = toCalendarEvent(
      { ...SESSION, session_type: 'exam', status: 'done' },
      'اختبار',
      null,
    )!;
    expect(exam.color?.primary).toBe('var(--color-burgundy)');
    expect(exam.color?.secondary).toBe('var(--color-danger)');
    expect(exam.color?.secondaryText).toBe('#fff');
    expect(exam.cssClass).toBe('st-exam ss-done');
    const revision = toCalendarEvent(
      { ...SESSION, session_type: 'revision', status: 'cancelled' },
      'مراجعة',
      null,
    )!;
    expect(revision.color?.primary).toBe('var(--color-gold)');
    expect(revision.color?.secondary).toBe('var(--color-gold-tint)');
    expect(revision.color?.secondaryText).toBe('var(--color-amber-dark)');
    expect(revision.cssClass).toBe('st-revision ss-cancelled');
  });

  it('converts a local-midnight Date to ISO without a UTC shift', () => {
    expect(dateToISODate(new Date(2026, 10, 18))).toBe('2026-11-18');
  });
});
