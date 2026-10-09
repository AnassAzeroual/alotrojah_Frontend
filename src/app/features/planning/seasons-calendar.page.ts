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
  resolveWeekDrop,
  toCalendarEvent,
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
  private readonly language = inject(LanguageService);
  private readonly i18n = inject(TranslateService);
  private readonly auth = inject(AuthService);
  protected readonly prefs = inject(AdminPrefsService);

  readonly saving = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly pickedSeason = signal<number | null>(null);
  readonly selectedId = signal<number | null>(null);
  readonly viewDate = signal<Date>(new Date());
  readonly view = signal<CalendarView>(CalendarView.Month);
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

  private readonly detailsRes = resource({
    params: () => ({ s: this.pickedSeason(), t: this.tick() }),
    loader: async ({ params }) => {
      if (params.s === null) return null;
      const terms = await firstValueFrom(this.planning.terms(params.s));
      const details = await Promise.all(
        terms.map((t) => firstValueFrom(this.planning.termDetail(t.id))),
      );
      return { terms, details };
    },
  });

  private readonly groupsRes = resource({
    loader: () => this.groupsSvc.listAll(),
  });

  /** Flat session feed with term/week context, derived during render. */
  private readonly flatRows = computed<CalSession[]>(() => {
    const loaded = this.detailsRes.value();
    if (!loaded) return [];
    const overlay = this.patchOverlay();
    const rows: CalSession[] = [];
    for (const d of loaded.details) {
      const term = loaded.terms.find((t) => t.id === d.id);
      for (const w of d.weeks) {
        for (const s of w.sessions ?? []) {
          rows.push({
            id: s.id,
            planned_date: overlay[s.id]?.planned_date ?? s.planned_date,
            start_time: overlay[s.id]?.start_time ?? s.start_time ?? null,
            end_time: overlay[s.id]?.end_time ?? s.end_time ?? null,
            group_id: s.group_id ?? null,
            session_type: s.session_type,
            status: s.status,
            session_number_global: s.session_number_global,
            term_id: d.id,
            termName: term?.name_ar ?? '',
            week_id: w.id,
            weekNumber: w.week_number_global,
            weekType: w.week_type,
          });
        }
      }
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
   * Debug panel (admin-only): events inside the period the calendar is
   * currently showing — day view = that day, week view = its Mon..Sun span,
   * month view = the whole visible grid (leading/trailing days included).
   */
  protected readonly visibleEvents = computed<CalendarEvent[]>(() => {
    const vd = this.viewDate();
    const all = this.calEvents();
    let start: Date;
    let end: Date;
    if (this.view() === CalendarView.Day) {
      start = new Date(vd.getFullYear(), vd.getMonth(), vd.getDate());
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    } else if (this.view() === CalendarView.Week) {
      start = this.startOfWeek(vd);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
    } else {
      // Month grid: from the week holding the 1st to the week holding the last day.
      start = this.startOfWeek(new Date(vd.getFullYear(), vd.getMonth(), 1));
      end = this.startOfWeek(new Date(vd.getFullYear(), vd.getMonth() + 1, 0));
      end.setDate(end.getDate() + 7);
    }
    return all.filter((e) => e.start >= start && e.start < end);
  });

  /** Local midnight of the Monday on/before `d` (weekStartsOn = 1). */
  private startOfWeek(d: Date): Date {
    const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const shift = (out.getDay() + 6) % 7;
    out.setDate(out.getDate() - shift);
    return out;
  }

  protected readonly selected = computed(
    () => this.flatRows().find((s) => s.id === this.selectedId()) ?? null,
  );

  protected readonly loading = () =>
    this.seasonsRes.isLoading() || this.detailsRes.isLoading() || this.groupsRes.isLoading();

  protected readonly txt = dropdownText;
  protected readonly num = dropdownNumber;

  constructor() {
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
    // Land on the season's first dated session. One-shot per season —
    // local PATCHes must never yank the view back.
    effect(() => {
      const season = this.pickedSeason();
      const rows = this.flatRows();
      if (season === null || rows.length === 0) return;
      const focus = this.focusDate();
      if (focus) {
        // One-shot deep link (?term=): land, then hand control back.
        this.focusDate.set(null);
        this.viewDate.set(new Date(`${focus.slice(0, 10)}T00:00:00`));
        this.navigatedFor = season;
        return;
      }
      if (this.navigatedFor === season) return;
      const first = rows
        .map((r) => r.planned_date)
        .filter((d): d is string => !!d)
        .sort()[0];
      if (!first) return;
      this.navigatedFor = season;
      this.viewDate.set(new Date(`${first.slice(0, 10)}T00:00:00`));
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
