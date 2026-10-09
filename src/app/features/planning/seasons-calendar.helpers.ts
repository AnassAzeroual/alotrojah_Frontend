import type { CalendarEvent } from 'angular-calendar';

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

/** Session event on the angular-calendar grid; `id` is the session id. */
export type CalSessionEvent = CalendarEvent;

/**
 * Session-event palette — matches how angular-calendar renders week/day events
 * natively: `primary` is the border, `secondary` the card background and
 * `secondaryText` the label (the custom month cell pinches the same contract).
 * Memorization/revision are soft-tinted cards with a strong 1px accent border;
 * exam stays a solid high-contrast badge.
 */
const EVENT_COLORS: Record<CalSession['session_type'], CalSessionEvent['color']> = {
  memorization: {
    primary: 'var(--color-memorization-border)',
    secondary: 'var(--color-memorization-bg)',
    secondaryText: 'var(--color-memorization-text)',
  },
  revision: {
    primary: 'var(--color-revision-border)',
    secondary: 'var(--color-revision-bg)',
    secondaryText: 'var(--color-revision-text)',
  },
  exam: {
    primary: 'var(--color-exam-border)',
    secondary: 'var(--color-exam-bg)',
    secondaryText: 'var(--color-exam-text)',
  },
};

/** Local-midnight Date -> ISO yyyy-mm-dd (no UTC shift). */
export function dateToISODate(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** The session fields a drag can rewrite (all optional but the payload's own id). */
export interface SessionPatch {
  planned_date?: string;
  start_time?: string;
  end_time?: string;
}

/** A resolved drag: the session to patch plus exactly what moved. */
export interface WeekDrop extends SessionPatch {
  id: number;
}

/** Local Date -> 24h `HH:MM`, the API's `date_format:H:i` clock. */
export function dateToClockTime(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Day ceiling everywhere (views render 6→22): no session clock runs past it. */
export const MAX_CLOCK = '22:00';

/** Clamp a zero-padded `HH:MM` clock to the day ceiling (lexicographic-safe). */
export function clampClock(time: string): string {
  return time > MAX_CLOCK ? MAX_CLOCK : time;
}

/**
 * Resolve a week-view drag into the fields it actually changed. angular-calendar
 * reports the drop's `newStart` plus a `newEnd` shifted by the same amount, so
 * one gesture can move the day, the time, or both while the duration survives.
 * Only fields that differ from the stored row come back — a drop that lands
 * nowhere new is null and the caller snaps back.
 */
export function resolveWeekDrop(
  eventId: unknown,
  newStart: Date,
  newEnd: Date | undefined,
  rows: CalSession[],
): WeekDrop | null {
  const id = Number(eventId);
  if (!Number.isInteger(id)) return null;
  const current = rows.find((r) => r.id === id);
  if (!current || !current.planned_date || !current.start_time || !current.end_time) return null;

  const drop: WeekDrop = { id };
  const iso = dateToISODate(newStart);
  if (current.planned_date.slice(0, 10) !== iso) drop.planned_date = iso;

  const storedStart = current.start_time.slice(0, 5);
  const storedEnd = current.end_time.slice(0, 5);
  const start = dateToClockTime(newStart);
  const end = newEnd === undefined ? storedEnd : dateToClockTime(newEnd);
  // Day ceiling: drops ending past 22:00 snap back (the grid ends there too).
  if (end > MAX_CLOCK) return null;
  if (start !== storedStart || end !== storedEnd) {
    drop.start_time = start;
    drop.end_time = end;
  }

  return drop.planned_date === undefined && drop.start_time === undefined ? null : drop;
}

/**
 * Session -> calendar event. Undated, untimed or group-less sessions are
 * skipped by the caller (the generator always dates, times and places them;
 * null means hand-built data). `groupLabel` rides the title — the grouped
 * lanes that used to carry it are queued as a follow-up.
 */
export function toCalendarEvent(
  s: CalSession,
  typeLabel: string,
  groupLabel: string | null,
): CalSessionEvent | null {
  if (!s.planned_date || !s.start_time || !s.end_time || s.group_id === null) return null;
  const day = s.planned_date.slice(0, 10);
  const title = [`#${s.session_number_global}`, typeLabel, groupLabel]
    .filter((part): part is string => !!part)
    .join(' · ');
  return {
    id: s.id,
    title,
    start: new Date(`${day}T${s.start_time.slice(0, 5)}`),
    end: new Date(`${day}T${s.end_time.slice(0, 5)}`),
    color: EVENT_COLORS[s.session_type],
    cssClass: `st-${s.session_type} ss-${s.status}`,
  };
}
