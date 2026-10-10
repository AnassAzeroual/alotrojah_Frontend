import { CalendarView } from 'angular-calendar';
import {
  clampClock,
  dateToClockTime,
  dateToISODate,
  resolveWeekDrop,
  startOfWeek,
  toCalendarEvent,
  viewRange,
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

  describe('viewRange', () => {
    const iso = (d: Date): string =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    it('covers exactly one calendar day in day view', () => {
      const { start, end } = viewRange(CalendarView.Day, new Date(2026, 9, 8, 15, 30));
      expect(iso(start)).toBe('2026-10-08');
      expect(iso(end)).toBe('2026-10-09');
    });

    it('covers the Mon–Sun span in week view', () => {
      // Thu 2026-10-08 → Mon 05 → next Mon 12.
      const { start, end } = viewRange(CalendarView.Week, new Date(2026, 9, 8));
      expect(iso(start)).toBe('2026-10-05');
      expect(iso(end)).toBe('2026-10-12');
    });

    it('covers the full visible grid in month view', () => {
      // October 2026: the 1st is a Thursday → grid Mon 28 Sep … Sun 1 Nov.
      const { start, end } = viewRange(CalendarView.Month, new Date(2026, 9, 15));
      expect(iso(start)).toBe('2026-09-28');
      expect(iso(end)).toBe('2026-11-02');
    });

    it('starts weeks on Monday', () => {
      expect(iso(startOfWeek(new Date(2026, 9, 11)))).toBe('2026-10-05'); // a Sunday
      expect(iso(startOfWeek(new Date(2026, 9, 12)))).toBe('2026-10-12'); // a Monday
    });
  });

  describe('clampClock', () => {
    it('caps clocks at the 23:59 ceiling', () => {
      expect(clampClock('23:30')).toBe('23:30');
      expect(clampClock('23:59')).toBe('23:59');
      expect(clampClock('21:59')).toBe('21:59');
      expect(clampClock('08:00')).toBe('08:00');
    });

    it('clamps a typed clock past the cap', () => {
      expect(clampClock('24:30')).toBe('23:59');
      expect(clampClock('25:00')).toBe('23:59');
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

    it('allows an evening drop (past the old 22:00 cap)', () => {
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 18, 21, 30), new Date(2026, 10, 18, 22, 30), rows),
      ).toEqual({ id: 19, start_time: '21:30', end_time: '22:30' });
    });

    it('allows a drop ending at the 23:59 ceiling', () => {
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 18, 23), new Date(2026, 10, 18, 23, 59), rows),
      ).toEqual({ id: 19, start_time: '23:00', end_time: '23:59' });
    });

    it('nulls a drop that would cross midnight (no rollover)', () => {
      expect(
        resolveWeekDrop(19, new Date(2026, 10, 18, 23, 30), new Date(2026, 10, 19, 0, 30), rows),
      ).toBeNull();
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
