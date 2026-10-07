import type { Group } from '../../core/api/api-models';

/** One session flattened with its term/week context for the calendar. */
export interface CalSession {
  id: number;
  planned_date: string | null;
  start_time: string | null;
  end_time: string | null;
  group_id: number | null;
  session_type: 'memorization' | 'revision' | 'exam';
  status: string;
  session_number_global: number;
  term_id: number;
  termName: string;
  week_id: number;
  weekNumber: number;
  weekType: 'study' | 'review';
}

/** Session shaped for the Syncfusion event engine (local wall-clock times). */
export interface Ej2SessionEvent {
  Id: number;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  IsAllDay: boolean;
  Description: string;
  GroupId: number;
  sessionId: number;
  sessionType: string;
  status: string;
  termId: number;
}

/** Local-midnight Date -> ISO yyyy-mm-dd (no UTC shift). */
export function dateToISODate(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Session -> scheduler event. Undated, untimed or group-less sessions cannot
 * sit on a grouped timeline and are skipped by the caller (the generator
 * always dates, times and places them; null means hand-built data).
 */
export function toEj2Event(s: CalSession, typeLabel: string): Ej2SessionEvent | null {
  if (!s.planned_date || !s.start_time || !s.end_time || s.group_id === null) return null;
  const day = s.planned_date.slice(0, 10);
  return {
    Id: s.id,
    Subject: `#${s.session_number_global} · ${typeLabel}`,
    StartTime: new Date(`${day}T${s.start_time.slice(0, 5)}`),
    EndTime: new Date(`${day}T${s.end_time.slice(0, 5)}`),
    IsAllDay: false,
    Description: s.termName,
    GroupId: s.group_id,
    sessionId: s.id,
    sessionType: s.session_type,
    status: s.status,
    termId: s.term_id,
  };
}

/** Active groups as scheduler resources, sorted by name. */
export function groupResources(groups: Group[]): {
  text: string;
  name: string;
  id: number;
  teacher: string | null;
}[] {
  return groups
    .filter((g) => g.is_active)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((g) => ({ text: g.name, name: g.name, id: g.id, teacher: g.teacher?.full_name ?? null }));
}
