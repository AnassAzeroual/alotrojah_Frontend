import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  AgendaService,
  DayService,
  MonthService,
  ScheduleComponent,
  ScheduleModule,
  TimelineMonthService,
  TimelineViewsService,
  WeekService,
  YearService,
  type ActionEventArgs,
  type DragEventArgs,
  type EventClickArgs,
  type EventRenderedArgs,
} from '@syncfusion/ej2-angular-schedule';
import { SeasonsService } from '../../core/api/seasons.service';
import { GroupsService } from '../../core/api/groups.service';
import './seasons-calendar.vendor.css';
import { PlanningService } from '../../core/api/planning.service';
import { apiErrorKey } from '../../core/api/api-errors';
import { LanguageService } from '../../core/i18n/language.service';
import { DatePickerComponent } from '../../shared/ui/date-picker/date-picker.component';
import {
  DropdownComponent,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import {
  dateToISODate,
  groupResources,
  toEj2Event,
  type CalSession,
  type Ej2SessionEvent,
} from './seasons-calendar.helpers';
import { ensureSchedulerLocale } from './seasons-calendar.locale';

/**
 * Experimental season calendar (the legacy season/term pages stay
 * untouched): every session of the picked season on one scheduler, grouped
 * by section, drag-drop to move dates, click a session for details.
 * Mutations reuse the existing PATCH endpoints — this page adds no backend
 * surface. EJ2 callbacks are not Angular-aware under zoneless, but the
 * handlers below only write signals, which always notify.
 */
@Component({
  selector: 'app-seasons-calendar-page',
  standalone: true,
  imports: [
    TranslatePipe,
    RouterLink,
    DropdownComponent,
    DatePickerComponent,
    ScheduleModule,
  ],
  providers: [
    DayService,
    WeekService,
    MonthService,
    YearService,
    AgendaService,
    TimelineViewsService,
    TimelineMonthService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seasons-calendar.page.html',
})
export class SeasonsCalendarPage {
  private readonly seasonsSvc = inject(SeasonsService);
  private readonly groupsSvc = inject(GroupsService);
  private readonly planning = inject(PlanningService);
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);
  private readonly i18n = inject(TranslateService);
  private readonly sched = viewChild(ScheduleComponent);

  readonly saving = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly pickedSeason = signal<number | null>(null);
  readonly selectedId = signal<number | null>(null);
  readonly selectedDate = signal<Date>(new Date());
  private readonly tick = signal(0);
  private navigatedFor: number | null = null;
  private readonly focusedTerm = signal<number | null>(null);
  /** Deep link (?term=): season + first date resolved from the term itself. */
  readonly term = input<number | null, string | null>(null, {
    transform: (v: string | null) => (v === null || v === '' ? null : Number(v)),
  });
  private readonly focusDate = signal<string | null>(null);

  protected readonly ejLocale = computed(() =>
    this.language.current() === 'ar' ? 'ar' : this.language.current() === 'fr' ? 'fr' : 'en',
  );
  protected readonly isRtl = computed(() => this.language.current() === 'ar');
  protected readonly resourceTitle = computed(() => {
    this.language.current();
    return this.i18n.instant('list.group');
  });

  protected readonly seasonOptions = computed(() => {
    const data = this.seasonsRes.value()?.data ?? [];
    return data.map((s) => ({ value: String(s.id), label: s.name }));
  });

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

  /** Flat session feed with term/week context, derived during render (never
   * a post-render effect write — EJ2 must see rows at creation time). */
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
            start_time: s.start_time ?? null,
            end_time: s.end_time ?? null,
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

  /** Optimistic date commits (cleared on server reload). */
  private readonly patchOverlay = signal<Record<number, { planned_date?: string }>>({});

  protected readonly ejEvents = computed<Ej2SessionEvent[]>(() => {
    this.language.current();
    const label = (t: string): string => this.i18n.instant(`sessionType.${t}`);
    const out: Ej2SessionEvent[] = [];
    for (const s of this.flatRows()) {
      const e = toEj2Event(s, label(s.session_type));
      if (e) out.push(e);
    }
    return out;
  });

  protected readonly ejResources = computed(() => groupResources(this.groupsRes.value() ?? []));

  protected readonly ejSettings = computed(() => ({ dataSource: this.ejEvents() }));

  protected readonly ejGroup = { resources: ['Groups'], allowGroupEdit: false };

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
    });
    // Async rows need one explicit kick: EJ2 builds its initial paint from
    // whatever dataSource is present at creation (usually still empty while
    // details stream in) and does not reliably repaint on later binding
    // updates. dataBind() is idempotent — reruns are harmless.
    effect(() => {
      const events = this.ejEvents();
      const api = this.sched();
      if (!api || events.length === 0) return;
      api.eventSettings.dataSource = events;
      api.dataBind();
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
        this.selectedDate.set(new Date(`${focus.slice(0, 10)}T00:00:00`));
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
      this.selectedDate.set(new Date(`${first.slice(0, 10)}T00:00:00`));
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
    // EJ2 locale bootstrap follows the app language (CLDR loads once).
    effect(() => {
      ensureSchedulerLocale(this.language.current());
    });
  }

  protected onEventClick(args: EventClickArgs): void {
    const rec = args.event as { Id?: unknown } | undefined;
    const id = typeof rec?.Id === 'number' ? rec.Id : Number(rec?.Id);
    if (Number.isInteger(id)) this.pickSession(id);
  }

  protected onDragStop(args: DragEventArgs): void {
    const rec = (Array.isArray(args.data) ? args.data[0] : args.data) as
      { Id?: unknown; StartTime?: unknown } | undefined;
    const start = rec?.StartTime instanceof Date ? rec.StartTime : null;
    if (typeof rec?.Id !== 'number' && typeof rec?.Id !== 'string') return;
    if (!start) return;
    this.patchDate(Number(rec.Id), dateToISODate(start));
  }

  /** No quick-create (M4 session endpoints are still pending): grid is move + inspect only. */
  protected onActionBegin(args: ActionEventArgs): void {
    if (args.requestType === 'eventCreate') args.cancel = true;
  }

  /** No built-in editor/quick-info: the detail card below owns edits. */
  protected onPopupOpen(args: { cancel: boolean }): void {
    args.cancel = true;
  }

  protected onEventRendered(args: EventRenderedArgs): void {
    const rec = args.data as { sessionType?: unknown; status?: unknown } | undefined;
    if (typeof rec?.sessionType === 'string') args.element?.classList.add(`st-${rec.sessionType}`);
    if (typeof rec?.status === 'string') args.element?.classList.add(`ss-${rec.status}`);
  }

  protected pickSeason(v: number | null): void {
    this.pickedSeason.set(v);
  }

  protected setDate(id: number, iso: string | null): void {
    if (iso === null) return;
    this.patchDate(id, iso);
  }

  protected pickSession(id: number): void {
    this.selectedId.set(id);
  }

  private patchDate(id: number, iso: string): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.errorKey.set(null);
    this.planning.updateSession(id, { planned_date: iso }).subscribe({
      next: () => {
        this.saving.set(false);
        this.patchOverlay.update((m) => ({ ...m, [id]: { planned_date: iso } }));
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorKey.set(apiErrorKey(err));
        // The detail picker already committed optimistically: reload truth.
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
