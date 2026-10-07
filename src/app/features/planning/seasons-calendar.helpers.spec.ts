import {
  dateToISODate,
  groupsForDay,
  sessionsForDay,
  toCalEvent,
  termBand,
  weekdayKey,
  type CalSession,
} from './seasons-calendar.helpers';

const SESSION: CalSession = {
  id: 19,
  planned_date: '2026-11-18',
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
  it('maps a session to a dated all-day event with styling hooks', () => {
    const e = toCalEvent(SESSION, 'حفظ')!;
    expect(e.id).toBe('19');
    expect(e.title).toBe('#19 · حفظ');
    expect(e.start).toBe('2026-11-18');
    expect(e.allDay).toBe(true);
    expect(e.classNames).toEqual(['st-memorization', 'ss-planned']);
    expect(e.extendedProps).toMatchObject({ termId: 2, weekNumber: 7 });
  });

  it('skips undated sessions (nothing to pin on the grid)', () => {
    expect(toCalEvent({ ...SESSION, planned_date: null }, 'حفظ')).toBeNull();
  });

  it('formats drop dates as local ISO without UTC shift', () => {
    expect(dateToISODate(new Date(2026, 10, 18))).toBe('2026-11-18');
  });

  it('builds a spanning non-draggable band per term', () => {
    const band = termBand(2, 'الفصل الثاني', ['2026-10-07', '2026-11-18', '2026-10-01'])!;
    expect(band.id).toBe('term-2');
    expect(band.title).toBe('الفصل الثاني');
    expect(band.start).toBe('2026-10-01');
    expect(band.end).toBe('2026-11-19');
    expect(band.editable).toBe(false);
    expect(band.classNames).toEqual(['term-band']);
    expect(band.extendedProps).toMatchObject({ kind: 'term', termId: 2 });
  });

  it('skips bands for dateless terms', () => {
    expect(termBand(2, 'الفصل الثاني', [])).toBeNull();
  });

  it('maps ISO dates to Mon..Sun keys without UTC shift', () => {
    expect(weekdayKey('2026-11-18')).toBe('Wed');
    expect(weekdayKey('2026-11-18T15:30:00')).toBe('Wed');
    expect(weekdayKey('2026-11-22')).toBe('Sun');
  });

  it('keeps only active groups meeting that weekday, sorted by name', () => {
    const groups = [
      {
        id: 2,
        name: 'ب',
        center_id: 1,
        level_id: 1,
        capacity: null,
        schedule_days: 'Wed',
        is_active: true,
      },
      {
        id: 1,
        name: 'أ',
        center_id: 1,
        level_id: 1,
        capacity: null,
        schedule_days: 'Mon,Wed',
        is_active: true,
      },
      {
        id: 3,
        name: 'مؤرشفة',
        center_id: 1,
        level_id: 1,
        capacity: null,
        schedule_days: 'Wed',
        is_active: false,
      },
      {
        id: 4,
        name: 'خميس',
        center_id: 1,
        level_id: 1,
        capacity: null,
        schedule_days: 'Thu',
        is_active: true,
      },
    ];
    expect(groupsForDay(groups, 'Wed').map((g) => g.id)).toEqual([1, 2]);
  });

  it('collects one date ordered by global session number', () => {
    const second = { ...SESSION, id: 20, session_number_global: 20 };
    const other = { ...SESSION, id: 21, planned_date: '2026-11-19', session_number_global: 21 };
    expect(sessionsForDay([second, SESSION, other], '2026-11-18').map((s) => s.id)).toEqual([
      19, 20,
    ]);
  });
});
