import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Subject } from 'rxjs';
import { JsonPipe, registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import localeFr from '@angular/common/locales/fr';
import {
  CalendarDateFormatter,
  CalendarDatePipe,
  CalendarDayViewComponent,
  CalendarEventTimesChangedEventType,
  CalendarEventTitleComponent,
  CalendarMonthViewComponent,
  CalendarNextViewDirective,
  CalendarPreviousViewDirective,
  CalendarTodayDirective,
  CalendarView,
  CalendarWeekViewComponent,
  DateAdapter,
  provideCalendar,
  type CalendarEvent,
  type CalendarEventTimesChangedEvent,
  type CalendarMonthViewDay,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SeasonsService } from '../../core/api/seasons.service';
import { GroupsService } from '../../core/api/groups.service';
import { PlanningService } from '../../core/api/planning.service';
import { CalendarService, type SessionCal, type WeekCal } from '../../core/api/calendar.service';
import { apiErrorKey } from '../../core/api/api-errors';
import { AuthService } from '../../core/auth/auth.service';
import { AdminPrefsService } from '../../core/settings/admin-prefs.service';
import { LanguageService } from '../../core/i18n/language.service';
import { SessionRangePickerComponent, type DateTimeRange } from './session-range-picker.component';
import {
  DropdownComponent,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import {
  dateToISODate,
  resolveWeekDrop,
  toCalendarEvent,
  viewRange,
  type CalSession,
  type CalSessionEvent,
  type SessionPatch,
  type WeekDrop,
} from './seasons-calendar.helpers';
import { SeasonsCalendarFormatter } from './seasons-calendar.formatter';

// The a11y pipe inside angular-calendar formats accessible labels via
// Angular's DatePipe, which needs registered locale data (our custom view
// formatter is Intl-based and unaffected). Registered from this lazy chunk,
// once per app run.
registerLocaleData(localeAr);
registerLocaleData(localeFr);

/** Persisted view tab (`month`/`week`/`day`) — unknown stored values fall back to month. */
const VIEW_KEY = 'alotrojah_cal_view';

function readStoredView(): CalendarView {
  const v = localStorage.getItem(VIEW_KEY);
  return v === CalendarView.Week || v === CalendarView.Day ? v : CalendarView.Month;
}

/**
 * Experimental season calendar (the legacy season/term pages stay
 * untouched): every session of the picked season on one calendar with
 * month/week/day views, click a session for details, start→end edits via the
 * detail range-picker. Mutations reuse the existing PATCH endpoints — this page
 * adds no backend surface. Week-view drag rewrites a session's day, its time,
 * or both through the same PATCH (`planned_date`, `start_time`, `end_time`);
 * resizes — duration edits — still snap back. Per-group lanes remain a queued
 * follow-up.
 */
@Component({
  selector: 'app-seasons-calendar-page',
  standalone: true,
  imports: [
    TranslatePipe,
    RouterLink,
    JsonPipe,
    DropdownComponent,
    SessionRangePickerComponent,
    CalendarPreviousViewDirective,
    CalendarTodayDirective,
    CalendarNextViewDirective,
    CalendarDatePipe,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    CalendarEventTitleComponent,
  ],
  providers: [
    provideCalendar({ provide: DateAdapter, useFactory: adapterFactory }),
    { provide: CalendarDateFormatter, useClass: SeasonsCalendarFormatter },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seasons-calendar.page.html',
})
export class SeasonsCalendarPage {
  private readonly seasonsSvc = inject(SeasonsService);
  private readonly groupsSvc = inject(GroupsService);
  private readonly planning = inject(PlanningService);
  private readonly calendar = inject(CalendarService);
  private readonly language = inject(LanguageService);
  private readonly i18n = inject(TranslateService);
  private readonly auth = inject(AuthService);
  protected readonly prefs = inject(AdminPrefsService);

  readonly saving = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly pickedSeason = signal<number | null>(null);
  readonly selectedId = signal<number | null>(null);
  readonly viewDate = signal<Date>(new Date());
  readonly view = signal<CalendarView>(readStoredView());
  private readonly tick = signal(0);
  private navigatedFor: number | null = null;
  private readonly focusedTerm = signal<number | null>(null);
  /** Deep link (?term=): season + first date resolved from the term itself. */
  readonly term = input<number | null, string | null>(null, {
    transform: (v: string | null) => (v === null || v === '' ? null : Number(v)),
  });
  private readonly focusDate = signal<string | null>(null);

  /** Template access to the view enum + the backend week grain (Mon..Sun). */
  protected readonly CalendarView = CalendarView;
  protected readonly weekStartsOn = 1;
  /** Manual re-render trigger: an unhandled drag snaps back to the data. */
  protected readonly refresh = new Subject<void>();
  /** Session moves (week drag, date edits) stay manager-only; everyone else is read-only. */
  protected readonly canManage = computed(() => {
    const r = this.auth.role();
    return r === 'admin' || r === 'supervisor';
  });
  /** Week view: a drag may rewrite day and/or time; resizes stay refused. */
  protected readonly allowDrag = (e: CalendarEventTimesChangedEvent): boolean =>
    this.canManage() && e.type !== CalendarEventTimesChangedEventType.Resize;
  /** Month view: the clicked day whose sessions show in the open-day box. */
  protected readonly activeDay = signal<Date | null>(null);
  protected readonly activeDayIsOpen = signal(false);
  /** The current-view events JSON panel: anyone with calendar access sees it
      once enabled in Settings (no admin gate, works in prod too). */

  protected readonly seasonOptions = computed(() => {
    const data = this.seasonsRes.value()?.data ?? [];
    return data.map((s) => ({ value: String(s.id), label: s.name }));
  });

  protected readonly titleKey = computed(() =>
    this.view() === CalendarView.Month
      ? 'monthViewTitle'
      : this.view() === CalendarView.Week
        ? 'weekViewTitle'
        : 'dayViewTitle',
  );

  private readonly seasonsRes = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.seasonsSvc.list()),
  });

  /** Term structure only (no sessions) — names for the detail card. */
  private readonly termsRes = resource({
    params: () => ({ s: this.pickedSeason() }),
    loader: async ({ params }) =>
      params.s === null ? [] : firstValueFrom(this.planning.terms(params.s)),
  });

  /** Week structure only (no sessions) — numbers/types for the detail card. */
  private readonly weeksRes = resource({
    params: () => ({ s: this.pickedSeason() }),
    loader: ({ params }) => this.loadAllWeeks(params.s),
  });

  /**
   * Sessions for the visible window only (a day, a Mon–Sun span, or the
   * month grid) — the week view no longer pays for the whole season.
   * The API bounds are inclusive on both ends while the view range is
   * end-exclusive, so `to` ships one day earlier — otherwise every window
   * fetches a row it never renders (and a non-empty fetch defeats the
   * land-on-empty effect below).
   */
  private readonly rangeRes = resource({
    params: () => {
      const r = viewRange(this.view(), this.viewDate());
      const inclusiveEnd = new Date(r.end);
      inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);
      return {
        s: this.pickedSeason(),
        from: dateToISODate(r.start),
        to: dateToISODate(inclusiveEnd),
        t: this.tick(),
      };
    },
    loader: ({ params }) => this.loadRangeSessions(params.s, params.from, params.to),
  });

  private async loadAllWeeks(season: number | null): Promise<WeekCal[]> {
    if (season === null) return [];
    const out: WeekCal[] = [];
    let page = 1;
    for (;;) {
      const res = await firstValueFrom(this.calendar.weeks({ season_id: season, page }));
      out.push(...res.data);
      if (res.meta.current_page * res.meta.per_page >= res.meta.total) break;
      page++;
    }
    return out;
  }

  private async loadRangeSessions(
    season: number | null,
    from: string,
    to: string,
  ): Promise<SessionCal[]> {
    if (season === null) return [];
    const out: SessionCal[] = [];
    let page = 1;
    for (;;) {
      const res = await firstValueFrom(
        this.calendar.sessions({ season_id: season, from, to, page }),
      );
      out.push(...res.data);
      if (res.meta.current_page * res.meta.per_page >= res.meta.total) break;
      page++;
    }
    return out;
  }

  private readonly groupsRes = resource({
    loader: () => this.groupsSvc.listAll(),
  });

  /** Flat session feed (visible window only) with term/week context, derived during render. */
  private readonly flatRows = computed<CalSession[]>(() => {
    const terms = this.termsRes.value() ?? [];
    const weeks = this.weeksRes.value() ?? [];
    const sessions = this.rangeRes.value() ?? [];
    const termById = new Map(terms.map((t) => [t.id, t]));
    const weekById = new Map(weeks.map((w) => [w.id, w]));
    const overlay = this.patchOverlay();
    const rows: CalSession[] = [];
    for (const s of sessions) {
      const term = termById.get(s.term_id);
      const week = weekById.get(s.week_id);
      rows.push({
        id: s.id,
        planned_date: overlay[s.id]?.planned_date ?? s.planned_date,
        start_time: overlay[s.id]?.start_time ?? s.start_time ?? null,
        end_time: overlay[s.id]?.end_time ?? s.end_time ?? null,
        group_id: s.group_id,
        session_type: s.session_type,
        status: s.status,
        session_number_global: s.session_number_global,
        term_id: s.term_id,
        termName: term?.name_ar ?? '',
        week_id: s.week_id,
        weekNumber: week?.week_number_global ?? 0,
        weekType: week?.week_type ?? 'study',
      });
    }
    return rows;
  });

  /** Optimistic day/time commits (cleared on server reload). */
  private readonly patchOverlay = signal<Record<number, SessionPatch>>({});

  private readonly groupNames = computed(() => {
    const map = new Map<number, string>();
    for (const g of this.groupsRes.value() ?? []) map.set(g.id, g.name);
    return map;
  });

  protected readonly calEvents = computed<CalSessionEvent[]>(() => {
    this.language.current();
    const names = this.groupNames();
    const out: CalSessionEvent[] = [];
    for (const s of this.flatRows()) {
      const typeLabel: string = this.i18n.instant(`sessionType.${s.session_type}`);
      const groupLabel = s.group_id === null ? null : (names.get(s.group_id) ?? null);
      const e = toCalendarEvent(s, typeLabel, groupLabel);
      if (e) out.push(e);
    }
    return out;
  });

  /**
   * Week view only: angular-calendar enables a drag exclusively on events
   * flagged `draggable`, so the week view gets a flagged copy for managers.
   * Month (custom cell template) and day views never set it, so they stay
   * non-draggable — as does the week view for read-only roles.
   */
  protected readonly weekEvents = computed<CalSessionEvent[]>(() =>
    this.calEvents().map((e) => ({ ...e, draggable: this.canManage() })),
  );

  /**
   * Current-view events JSON: the fetch window already matches the view, so
   * this is a client-side guard for overlay-shifted rows at the edges.
   */
  protected readonly visibleEvents = computed<CalendarEvent[]>(() => {
    const { start, end } = viewRange(this.view(), this.viewDate());
    const all = this.calEvents();
    return all.filter((e) => e.start >= start && e.start < end);
  });

  protected readonly selected = computed(
    () => this.flatRows().find((s) => s.id === this.selectedId()) ?? null,
  );

  protected readonly loading = () =>
    this.seasonsRes.isLoading() ||
    this.termsRes.isLoading() ||
    this.weeksRes.isLoading() ||
    this.rangeRes.isLoading() ||
    this.groupsRes.isLoading();

  protected readonly txt = dropdownText;
  protected readonly num = dropdownNumber;

  constructor() {
    // The selected tab survives reloads (view only — the date stays live).
    effect(() => {
      localStorage.setItem(VIEW_KEY, this.view());
    });
    // Default to the current season, then the first one.
    effect(() => {
      if (this.pickedSeason() !== null) return;
      const data = this.seasonsRes.value()?.data ?? [];
      if (data.length === 0) return;
      const cur = data.find((s) => s.is_current) ?? data[0];
      this.pickedSeason.set(cur.id);
    });
    // Season switches clear the selection (rows derive during render).
    effect(() => {
      this.pickedSeason();
      this.selectedId.set(null);
      this.activeDayIsOpen.set(false);
    });
    // Land onto an empty window, one-shot per season: first paint shows
    // today when it holds sessions; otherwise jump to the season's own start
    // instead of a blank grid (no extra probe — the dates ride the seasons
    // list). Local PATCHes never yank back.
    effect(() => {
      const season = this.pickedSeason();
      if (season === null || this.navigatedFor === season) return;
      const focus = this.focusDate();
      if (focus) {
        // One-shot deep link (?term=): land, then hand control back.
        this.focusDate.set(null);
        this.viewDate.set(new Date(`${focus.slice(0, 10)}T00:00:00`));
        this.navigatedFor = season;
        return;
      }
      if (this.loading() || this.flatRows().length > 0) return;
      const start = (this.seasonsRes.value()?.data ?? [])
        .find((s) => s.id === season)
        ?.start_date?.slice(0, 10);
      if (!start) return;
      this.navigatedFor = season;
      this.viewDate.set(new Date(`${start}T00:00:00`));
    });
    // Deep link: resolve the term's own season + first date, then drive the
    // normal pipeline (season pick -> load -> land effect above).
    effect(() => {
      const t = this.term();
      if (t === null || !Number.isInteger(t) || t <= 0 || this.focusedTerm() === t) return;
      this.focusedTerm.set(t);
      void firstValueFrom(this.planning.termDetail(t))
        .then((d) => {
          const dates = (d.weeks ?? [])
            .flatMap((w) => w.sessions ?? [])
            .map((s) => s.planned_date)
            .filter((x): x is string => !!x)
            .sort();
          this.pickedSeason.set(d.season_id);
          this.focusDate.set(dates[0]?.slice(0, 10) ?? null);
        })
        .catch(() => undefined);
    });
  }

  protected onEventClick(args: { event: CalendarEvent }): void {
    const id = Number(args.event.id);
    if (Number.isInteger(id)) this.pickSession(id);
  }

  /**
   * Month view: clicking a day toggles the open-day box listing that day's
   * sessions. Deliberately does NOT change the view date — only the panel.
   */
  protected onDayClick(args: { day: CalendarMonthViewDay }): void {
    const { date, events } = args.day;
    if (events.length === 0) {
      this.activeDayIsOpen.set(false);
      return;
    }
    const sameDay =
      this.activeDay() !== null && this.activeDay()!.toDateString() === date.toDateString();
    this.activeDay.set(date);
    this.activeDayIsOpen.set(!(sameDay && this.activeDayIsOpen()));
  }

  /**
   * Week view: a drag persists whatever it actually changed — the day, the
   * time, or both — through the session PATCH. A drop that lands nowhere new,
   * and any resize (refused up front), snaps back. The library already confines
   * drops to the visible week, so a move can never cross a week boundary.
   */
  protected onWeekTimesChanged(evt: CalendarEventTimesChangedEvent): void {
    if (evt.type === CalendarEventTimesChangedEventType.Resize) {
      this.refresh.next();
      return;
    }
    const drop = resolveWeekDrop(evt.event.id, evt.newStart, evt.newEnd, this.flatRows());
    if (drop === null) {
      this.refresh.next();
      return;
    }
    this.patchSession(drop);
  }

  protected groupLabel(id: number | null): string | null {
    return id === null ? null : (this.groupNames().get(id) ?? null);
  }

  protected pickSeason(v: number | null): void {
    this.pickedSeason.set(v);
  }

  protected setRange(id: number, range: DateTimeRange | null): void {
    if (range === null) return;
    const drop: WeekDrop = {
      id,
      planned_date: range.start.slice(0, 10),
      start_time: range.start.slice(11, 16),
      end_time: range.end.slice(11, 16),
    };
    // Same native change-event semantics as the drag path: skip identical picks.
    const current = this.flatRows().find((r) => r.id === id);
    if (
      current?.planned_date?.slice(0, 10) === drop.planned_date &&
      current?.start_time?.slice(0, 5) === drop.start_time &&
      current?.end_time?.slice(0, 5) === drop.end_time
    ) {
      return;
    }
    this.patchSession(drop);
  }

  /** Detail-card range value from a session row (null until dated + timed). */
  protected rangeOf(sel: CalSession): DateTimeRange | null {
    if (!sel.planned_date || !sel.start_time || !sel.end_time) return null;
    const d = sel.planned_date.slice(0, 10);
    return {
      start: `${d}T${sel.start_time.slice(0, 5)}`,
      end: `${d}T${sel.end_time.slice(0, 5)}`,
    };
  }

  protected pickSession(id: number): void {
    this.selectedId.set(id);
  }

  /**
   * Optimistically apply a day/time change, then persist via PATCH. The
   * week-view drag and the detail range-picker share this path; on failure the
   * overlay is rolled back and the truth is reloaded.
   */
  private patchSession(drop: WeekDrop): void {
    if (this.saving()) return;
    const { id, ...patch } = drop;
    this.saving.set(true);
    this.errorKey.set(null);
    this.patchOverlay.update((m) => ({ ...m, [id]: { ...m[id], ...patch } }));
    this.planning.updateSession(id, patch).subscribe({
      next: () => {
        this.saving.set(false);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorKey.set(apiErrorKey(err));
        this.patchOverlay.update((m) => {
          const next = { ...m };
          delete next[id];
          return next;
        });
        this.tick.update((n) => n + 1);
      },
    });
  }
}
