import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
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
  CalendarEventTitleComponent,
  CalendarMonthViewComponent,
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
import { PlanningService } from '../../core/api/planning.service';
import { CalendarService } from '../../core/api/calendar.service';
import { SessionCalendarResource } from '../../core/api/models';
import { AuthService } from '../../core/auth/auth.service';
import { AdminPrefsService } from '../../core/settings/admin-prefs.service';
import { LanguageService } from '../../core/i18n/language.service';
import { SecureStorageService } from '../../core/storage/secure-storage.service';
import { SessionRangePickerComponent, type DateTimeRange } from './session-range-picker.component';
import {
  DropdownComponent,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import {
  buildYearGrid,
  dateToISODate,
  nowSegmentIndex,
  resolveWeekDrop,
  toCalendarEvent,
  viewRange,
  type CalendarPageView,
  type CalSession,
  type CalSessionEvent,
  type SessionPatch,
  type WeekDrop,
  type YearDayCounts,
} from './seasons-calendar.helpers';
import { SeasonsCalendarFormatter } from './seasons-calendar.formatter';

// The a11y pipe inside angular-calendar formats accessible labels via
// Angular's DatePipe, which needs registered locale data (our custom view
// formatter is Intl-based and unaffected). Registered from this lazy chunk,
// once per app run.
registerLocaleData(localeAr);
registerLocaleData(localeFr);

/** Persisted view tab (`month`/`week`/`day`/`year`) — unknown stored values fall back to month. */
const VIEW_KEY = 'alotrojah_cal_view';

function readStoredView(read: (key: string) => string | null): CalendarPageView {
  const v = read(VIEW_KEY);
  if (v === 'year' || v === CalendarView.Week || v === CalendarView.Day) return v;
  return CalendarView.Month;
}

/**
 * Experimental season calendar (the legacy season/term pages stay
 * untouched): every session of the picked season on one calendar with
 * month/week/day/year views, click a session for details, start→end edits via
 * the detail range-picker. Mutations reuse the existing PATCH endpoints — this
 * page adds no backend surface. Week-view drag rewrites a session's day, its
 * time, or both through the same PATCH (`planned_date`, `start_time`,
 * `end_time`); dragging either edge resizes the duration through the same
 * start/end fields. The year tab is a read-only overview: 12 mini-months with
 * per-day session badges; clicking a day jumps to the month view at that date.
 * Per-group lanes remain a queued follow-up.
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
    CalendarTodayDirective,
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
  private readonly planning = inject(PlanningService);
  private readonly calendar = inject(CalendarService);
  private readonly language = inject(LanguageService);
  private readonly i18n = inject(TranslateService);
  private readonly auth = inject(AuthService);
  protected readonly prefs = inject(AdminPrefsService);
  private readonly storage = inject(SecureStorageService);
  /** The page host: queried for the rendered time-grid so we can scroll to now. */
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly saving = signal(false);
  readonly pickedSeason = signal<number | null>(null);
  readonly selectedId = signal<number | null>(null);
  readonly viewDate = signal<Date>(new Date());
  readonly view = signal<CalendarPageView>(readStoredView((k) => this.storage.read(k)));
  private readonly tick = signal(0);
  private navigatedFor: number | null = null;
  /** Auto-scroll de-dupe key: re-arms only on a view/date/locale change. */
  private lastAutoScrollKey: string | null = null;
  private readonly focusedTerm = signal<number | null>(null);
  /** Deep link (?term=): season + first date resolved from the term itself. */
  readonly term = input<number | null, string | null | undefined>(null, {
    // A missing query param arrives as undefined (not null) — normalize it,
    // otherwise Number(undefined) yields NaN and every null-check misfires.
    transform: (v) => (v === null || v === undefined || v === '' ? null : Number(v)),
  });
  /** Deep link (?date=): a shareable day/week/month entry point, one-shot. */
  readonly date = input<string | null>(null);
  private dateConsumed = false;
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
  /** §D: the events-JSON debug panel is admin-only (mirrors internal state). */
  protected readonly isAdmin = computed(() => this.auth.role() === 'admin');
  /** Week view: managers may move a session and resize either edge. */
  protected readonly allowDrag = (): boolean => this.canManage();
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
        : this.view() === CalendarView.Day
          ? 'dayViewTitle'
          : 'yearViewTitle',
  );

  private readonly seasonsRes = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.seasonsSvc.list()),
  });

  /**
   * Display-ready window feed (sessions + card names, one request): a day,
   * a Mon–Sun span, or the month grid — the week view no longer pays for the
   * whole season. The API bounds are inclusive on both ends while the view
   * range is end-exclusive, so `to` ships one day earlier — otherwise every
   * window fetches a row it never renders (and a non-empty fetch defeats the
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
    loader: ({ params }) => this.loadFeed(params.s, params.from, params.to),
  });

  private async loadFeed(
    season: number | null,
    from: string,
    to: string,
  ): Promise<SessionCalendarResource[]> {
    if (season === null) return [];
    const out: SessionCalendarResource[] = [];
    let page = 1;
    for (;;) {
      const res = await firstValueFrom(this.calendar.feed({ season_id: season, from, to, page }));
      out.push(...res.data);
      if (res.meta.current_page * res.meta.per_page >= res.meta.total) break;
      page++;
    }
    return out;
  }

  /** Flat session feed (visible window only), derived during render. */
  private readonly flatRows = computed<CalSession[]>(() => {
    const sessions = this.rangeRes.value() ?? [];
    const overlay = this.patchOverlay();
    const rows: CalSession[] = [];
    for (const s of sessions) {
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
        termName: s.term_name ?? '',
        week_id: s.week_id,
        weekNumber: s.week_number_global ?? 0,
        weekType: s.week_type ?? 'study',
      });
    }
    return rows;
  });

  /** Optimistic day/time commits (cleared on server reload). */
  private readonly patchOverlay = signal<Record<number, SessionPatch>>({});

  /** Group names for titles — carried by the feed rows themselves. */
  private readonly groupNames = computed(() => {
    const map = new Map<number, string>();
    for (const s of this.rangeRes.value() ?? []) {
      if (s.group_id !== null && s.group_name) map.set(s.group_id, s.group_name);
    }
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
   * Week view only: angular-calendar enables drag and both resize edges only on
   * events flagged `draggable`/`resizable`, so the week view gets a flagged copy
   * for managers. Month (custom cell template) and day views never set them, so
   * they stay read-only — as does the week view for read-only roles.
   */
  protected readonly weekEvents = computed<CalSessionEvent[]>(() => {
    const manage = this.canManage();
    return this.calEvents().map((e) => ({
      ...e,
      draggable: manage,
      resizable: { beforeStart: manage, afterEnd: manage },
    }));
  });

  /**
   * Current-view events JSON: the fetch window already matches the view, so
   * this is a client-side guard for overlay-shifted rows at the edges.
   */
  protected readonly visibleEvents = computed<CalendarEvent[]>(() => {
    const { start, end } = viewRange(this.view(), this.viewDate());
    const all = this.calEvents();
    return all.filter((e) => e.start >= start && e.start < end);
  });

  /**
   * Year overview: 12 mini-months of the shown year, each day carrying its
   * session counts (per type + total). Built from the flat feed, so overlay
   * days from a recent drag still surface. Out-of-month lead-in/tail cells sit
   * outside the fetch window and render empty.
   */
  protected readonly yearGrid = computed(() => {
    const counts = new Map<string, YearDayCounts>();
    for (const s of this.flatRows()) {
      if (!s.planned_date) continue;
      const iso = s.planned_date.slice(0, 10);
      const c = counts.get(iso) ?? { memorization: 0, revision: 0, exam: 0 };
      c[s.session_type] += 1;
      counts.set(iso, c);
    }
    return buildYearGrid(this.viewDate().getFullYear(), counts, dateToISODate(new Date()));
  });

  /** Seven short weekday labels starting Monday, locale-aware and digit-stable. */
  protected readonly yearWeekdayLabels = computed(() => {
    const loc = this.language.current();
    const digits = loc.includes('-u-') ? loc : `${loc}-u-nu-latn`;
    const fmt = new Intl.DateTimeFormat(digits, { weekday: 'short' });
    const monday = new Date(2026, 0, 5); // a Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return fmt.format(d);
    });
  });

  /** One calendar step back/forward: day → ±1 day, week → ±1 week, month → ±1 month, year → ±1 year. */
  protected stepDate(delta: number): void {
    const v = this.view();
    this.viewDate.update((d) => {
      const out = new Date(d);
      if (v === 'year') out.setFullYear(out.getFullYear() + delta);
      else if (v === CalendarView.Day) out.setDate(out.getDate() + delta);
      else if (v === CalendarView.Week) out.setDate(out.getDate() + delta * 7);
      else out.setMonth(out.getMonth() + delta);
      return out;
    });
  }

  /** Year overview: opening a day (or a month header) drops into the month view at that date. */
  protected jumpToDay(date: Date): void {
    this.viewDate.set(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    this.view.set(CalendarView.Month);
  }

  protected readonly selected = computed(
    () => this.flatRows().find((s) => s.id === this.selectedId()) ?? null,
  );

  protected readonly loading = () => this.seasonsRes.isLoading() || this.rangeRes.isLoading();

  protected readonly txt = dropdownText;
  protected readonly num = dropdownNumber;

  constructor() {
    // The selected tab survives reloads (view only — the date stays live).
    effect(() => {
      this.storage.write(VIEW_KEY, this.view());
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
    // Deep links land once (?term= wins over ?date=); empty windows never
    // yank — an empty day is truthful, and navigation stays with the user.
    // Local PATCHes never move the view either.
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
    });
    // ?date= deep link (shareable day/week/month links): one-shot viewDate.
    // ?term= wins when both are present.
    effect(() => {
      const d = this.date();
      if (this.dateConsumed || d === null || this.term() !== null) return;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
      const dt = new Date(`${d}T00:00:00`);
      if (Number.isNaN(dt.getTime())) return;
      this.dateConsumed = true;
      this.viewDate.set(dt);
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
    // Land the week/day grid on the current wall clock, once per view/date/
    // locale change (a locale switch recreates the view). Month view re-arms it,
    // so returning to a time grid scrolls again. The target is clock-derived,
    // not date-derived — it works even when today is off-screen.
    afterRenderEffect(() => {
      const view = this.view();
      const date = this.viewDate();
      const locale = this.language.current();
      if (view !== CalendarView.Week && view !== CalendarView.Day) {
        this.lastAutoScrollKey = null;
        return;
      }
      const key = `${view}|${dateToISODate(date)}|${locale}`;
      if (key === this.lastAutoScrollKey) return;
      this.lastAutoScrollKey = key;
      this.scrollGridToCurrentTime();
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
   * Week view: a drag or an edge-resize persists whatever it actually changed —
   * the day, the start/end time, or both — through the session PATCH. A gesture
   * that lands nowhere new snaps back, as does a resize that would end at or
   * before its own start (i.e. cross midnight). The library already confines
   * gestures to the visible week, so a move can never cross a week boundary.
   */
  protected onWeekTimesChanged(evt: CalendarEventTimesChangedEvent): void {
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
   * Centre the week/day time grid on the current wall clock. Every column
   * renders the full 00:00→24:00 day, so the target slot is clock-derived (not
   * date-derived) and correct even when today is off-screen. Instant, not
   * animated: this is a landing position. The browser clamps it at the document
   * edges, so early/late hours still land on-screen.
   */
  private scrollGridToCurrentTime(): void {
    const column = this.host.nativeElement.querySelector<HTMLElement>(
      '.cal-time-events .cal-day-column',
    );
    const segments = column?.querySelectorAll<HTMLElement>('.cal-hour-segment') ?? [];
    const now = new Date();
    const index = nowSegmentIndex(now.getHours(), now.getMinutes(), segments.length);
    if (index < 0) return;
    segments[index].scrollIntoView({ block: 'center', inline: 'nearest' });
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
    this.patchOverlay.update((m) => ({ ...m, [id]: { ...m[id], ...patch } }));
    this.planning.updateSession(id, patch).subscribe({
      next: () => {
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
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
