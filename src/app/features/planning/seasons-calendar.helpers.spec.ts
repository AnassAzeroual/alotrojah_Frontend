import { groupResources, toEj2Event, type CalSession } from './seasons-calendar.helpers';

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
  it('maps a session to a timed grouped event', () => {
    const e = toEj2Event(SESSION, 'حفظ')!;
    expect(e.Id).toBe(19);
    expect(e.Subject).toBe('#19 · حفظ');
    expect(e.StartTime).toEqual(new Date('2026-11-18T08:00'));
    expect(e.EndTime).toEqual(new Date('2026-11-18T09:00'));
    expect(e.IsAllDay).toBe(false);
    expect(e.GroupId).toBe(4);
    expect(e.Description).toBe('الفصل الثاني');
  });

  it('skips undated, untimed or group-less sessions (nothing to pin)', () => {
    expect(toEj2Event({ ...SESSION, planned_date: null }, 'حفظ')).toBeNull();
    expect(toEj2Event({ ...SESSION, start_time: null }, 'حفظ')).toBeNull();
    expect(toEj2Event({ ...SESSION, end_time: null }, 'حفظ')).toBeNull();
    expect(toEj2Event({ ...SESSION, group_id: null }, 'حفظ')).toBeNull();
  });

  it('keeps active groups as sorted resources', () => {
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
    ];
    expect(groupResources(groups)).toEqual([
      { text: 'أ', name: 'أ', id: 1, teacher: null },
      { text: 'ب', name: 'ب', id: 2, teacher: null },
    ]);
  });
});
