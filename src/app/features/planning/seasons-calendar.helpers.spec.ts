import {
  clampClock,
  dateToClockTime,
  dateToISODate,
  resolveWeekDrop,
  toCalendarEvent,
  type CalSession,
} from './seasons-calendar.helpers';

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
    expect(e.color?.primary).toBe('var(--color-memorization-border)');
    expect(e.color?.secondary).toBe('var(--color-memorization-bg)');
    expect(e.color?.secondaryText).toBe('var(--color-memorization-text)');
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
    expect(exam.color?.primary).toBe('var(--color-exam-border)');
    expect(exam.color?.secondary).toBe('var(--color-exam-bg)');
    expect(exam.color?.secondaryText).toBe('var(--color-exam-text)');
    expect(exam.cssClass).toBe('st-exam ss-done');
    const revision = toCalendarEvent(
      { ...SESSION, session_type: 'revision', status: 'cancelled' },
      'مراجعة',
      null,
    )!;
    expect(revision.color?.primary).toBe('var(--color-revision-border)');
    expect(revision.color?.secondary).toBe('var(--color-revision-bg)');
    expect(revision.color?.secondaryText).toBe('var(--color-revision-text)');
    expect(revision.cssClass).toBe('st-revision ss-cancelled');
  });

  it('converts a local-midnight Date to ISO without a UTC shift', () => {
    expect(dateToISODate(new Date(2026, 10, 18))).toBe('2026-11-18');
  });

  it('formats a local Date as the API 24h clock', () => {
    expect(dateToClockTime(new Date(2026, 10, 18, 8, 5))).toBe('08:05');
    expect(dateToClockTime(new Date(2026, 10, 18, 23, 0))).toBe('23:00');
  });

  describe('clampClock', () => {
    it('caps late clocks at the 22:00 ceiling', () => {
      expect(clampClock('23:30')).toBe('22:00');
      expect(clampClock('22:00')).toBe('22:00');
      expect(clampClock('21:59')).toBe('21:59');
      expect(clampClock('08:00')).toBe('08:00');
    });
  });

  describe('resolveWeekDrop', () => {
    const rows = [SESSION];

    it('returns only the day when the drop keeps the time of day', () => {
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 20, 8), new Date(2026, 10, 20, 9), rows),
      ).toEqual({ id: 19, planned_date: '2026-11-20' });
    });

    it('returns only the time when the drop stays on the same day', () => {
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 18, 10, 30), new Date(2026, 10, 18, 11, 30), rows),
      ).toEqual({ id: 19, start_time: '10:30', end_time: '11:30' });
    });

    it('returns both when a diagonal drop moves the day and the time', () => {
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 20, 6), new Date(2026, 10, 20, 7), rows),
      ).toEqual({ id: 19, planned_date: '2026-11-20', start_time: '06:00', end_time: '07:00' });
    });

    it('nulls a drop ending past the 22:00 ceiling', () => {
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 18, 21, 30), new Date(2026, 10, 18, 22, 30), rows),
      ).toBeNull();
    });

    it('allows a drop ending exactly at the 22:00 ceiling', () => {
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 18, 21), new Date(2026, 10, 18, 22), rows),
      ).toEqual({ id: 19, start_time: '21:00', end_time: '22:00' });
    });

    it('nulls a drop that lands exactly where the session already is', () => {
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 18, 8), new Date(2026, 10, 18, 9), rows),
      ).toBeNull();
    });

    it('nulls unknown ids and sessions the calendar never renders', () => {
      expect(resolveWeekDrop(999, new Date(2026, 10, 20), undefined, rows)).toBeNull();
      expect(resolveWeekDrop('nope', new Date(2026, 10, 20), undefined, rows)).toBeNull();
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 20), undefined, [{ ...SESSION, start_time: null }]),
      ).toBeNull();
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 20), undefined, [
          { ...SESSION, planned_date: null },
        ]),
      ).toBeNull();
    });
  });
});
