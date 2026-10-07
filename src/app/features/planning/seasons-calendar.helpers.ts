import type { EventInput } from '@fullcalendar/core';

/** One session flattened with its term/week context for the calendar. */
export interface CalSession {
  id: number;
  planned_date: string | null;
  session_type: 'memorization' | 'revision' | 'exam';
  status: string;
  session_number_global: number;
  term_id: number;
  termName: string;
  week_id: number;
  weekNumber: number;
  weekType: 'study' | 'review';
}

/** Local-midnight Date -> ISO yyyy-mm-dd (no UTC shift). */
export function dateToISODate(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** ISO date shifted by whole days (exclusive end bounds). */
export function addDaysISO(iso: string, n: number): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  d.setDate(d.getDate() + n);
  return dateToISODate(d);
}

/**
 * Session -> FullCalendar event. Undated sessions cannot sit on a grid and
 * are skipped by the caller (the generator always dates them; null means
 * hand-built data). Styling hooks: st-<type> + ss-<status>.
 */
export function toCalEvent(s: CalSession, typeLabel: string): EventInput | null {
  if (!s.planned_date) return null;
  return {
    id: String(s.id),
    title: `#${s.session_number_global} · ${typeLabel}`,
    start: s.planned_date.slice(0, 10),
    allDay: true,
    classNames: [`st-${s.session_type}`, `ss-${s.status}`],
    extendedProps: {
      kind: 'session',
      termId: s.term_id,
      termName: s.termName,
      weekId: s.week_id,
      weekNumber: s.weekNumber,
      weekType: s.weekType,
      sessionType: s.session_type,
      status: s.status,
    },
  };
}

/**
 * One band per term (multi-day, non-draggable): the terms become visible on
 * the grid itself. Clicking a band opens the term page (handled by kind).
 */
export function termBand(termId: number, termName: string, dates: string[]): EventInput | null {
  const ds = dates.map((d) => d.slice(0, 10)).sort();
  if (ds.length === 0) return null;
  return {
    id: `term-${termId}`,
    title: termName,
    start: ds[0],
    end: addDaysISO(ds[ds.length - 1], 1),
    allDay: true,
    editable: false,
    classNames: ['term-band'],
    extendedProps: { kind: 'term', termId },
  };
}
