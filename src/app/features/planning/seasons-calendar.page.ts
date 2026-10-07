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
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { type CalendarOptions, type EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar';
import frLocale from '@fullcalendar/core/locales/fr';
import { SeasonsService } from '../../core/api/seasons.service';
import { PlanningService } from '../../core/api/planning.service';
import { apiErrorKey } from '../../core/api/api-errors';
import { LanguageService } from '../../core/i18n/language.service';
import { DatePickerComponent } from '../../shared/ui/date-picker/date-picker.component';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { dateToISODate, termBand, toCalEvent, type CalSession } from './seasons-calendar.helpers';

/**
 * Experimental full-calendar sandbox for seasons (the legacy season/term
 * pages stay untouched): every session of the picked season on one grid,
 * drag-drop to move dates, click a session for details. Mutations reuse the
 * existing PATCH endpoints — this page adds no backend surface.
 */
@Component({
  selector: 'app-seasons-calendar-page',
  standalone: true,
  imports: [
    TranslatePipe,
    RouterLink,
    DropdownComponent,
    DatePickerComponent,
    SpinnerComponent,
    FullCalendarModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seasons-calendar.page.html',
})
export class SeasonsCalendarPage {
  private readonly seasonsSvc = inject(SeasonsService);
  private readonly planning = inject(PlanningService);
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);
  private readonly i18n = inject(TranslateService);
  private readonly cal = viewChild(FullCalendarComponent);

  protected readonly txt = dropdownText;
  protected readonly num = dropdownNumber;

  readonly saving = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly pickedSeason = signal<number | null>(null);
  readonly selectedId = signal<number | null>(null);
  private readonly tick = signal(0);
  private navigatedFor: number | null = null;
  private readonly focusedTerm = signal<number | null>(null);
  /** Deep link (?term=): season + first date resolved from the term itself. */
  readonly term = input<number | null, string | null>(null, {
    transform: (v: string | null) => (v === null || v === '' ? null : Number(v)),
  });
  private readonly focusDate = signal<string | null>(null);

  private readonly seasonsRes = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.seasonsSvc.list()),
  });

  protected readonly seasonOptions = computed<DropdownOption[]>(() => {
    const data = this.seasonsRes.value()?.data ?? [];
    return data.map((s) => ({ value: String(s.id), label: s.name }));
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

  /** Flat session feed with term/week context (local PATCHes edit in place). */
  private readonly allSessions = signal<CalSession[]>([]);

  protected readonly selected = computed(
    () => this.allSessions().find((s) => s.id === this.selectedId()) ?? null,
  );

  protected readonly loading = () => this.seasonsRes.isLoading() || this.detailsRes.isLoading();

  constructor() {
    // Default to the current season, then the first one.
    effect(() => {
      if (this.pickedSeason() !== null) return;
      const data = this.seasonsRes.value()?.data ?? [];
      if (data.length === 0) return;
      const cur = data.find((s) => s.is_current) ?? data[0];
      this.pickedSeason.set(cur.id);
    });
    // Flatten once per load; season switches clear the selection.
    effect(() => {
      const loaded = this.detailsRes.value();
      if (!loaded) return;
      const rows: CalSession[] = [];
      for (const d of loaded.details) {
        const term = loaded.terms.find((t) => t.id === d.id);
        for (const w of d.weeks) {
          for (const s of w.sessions ?? []) {
            rows.push({
              id: s.id,
              planned_date: s.planned_date,
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
      this.allSessions.set(rows);
      this.selectedId.set(null);
    });
    // Land the grid on the season's first dated session. Separate effect
    // (not inside the flatten one): the calendar view may not exist yet when
    // data lands, and local PATCHes must never yank the view back.
    effect(() => {
      const season = this.pickedSeason();
      const rows = this.allSessions();
      const api = this.api();
      if (season === null || rows.length === 0 || !api) return;
      const focus = this.focusDate();
      if (focus) {
        // One-shot deep link (?term=): land, then hand control back.
        this.focusDate.set(null);
        api.gotoDate(focus.slice(0, 10));
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
      api.gotoDate(first.slice(0, 10));
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
    // Language switch re-localises + repaints (labels are instant-read).
    effect(() => {
      const lang = this.language.current();
      const api = this.cal()?.getApi();
      if (!api) return;
      api.setOption('locale', lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en');
      api.setOption('direction', lang === 'ar' ? 'rtl' : 'ltr');
      api.refetchEvents();
    });
  }

  private api(): ReturnType<FullCalendarComponent['getApi']> | undefined {
    return this.cal()?.getApi();
  }

  protected readonly options: CalendarOptions = {
    plugins: [dayGridPlugin, multiMonthPlugin, listPlugin, interactionPlugin],
    locales: [arLocale, frLocale],
    locale:
      this.language.current() === 'ar' ? 'ar' : this.language.current() === 'fr' ? 'fr' : 'en',
    direction: this.language.current() === 'ar' ? 'rtl' : 'ltr',
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth,multiMonthYear,listWeek',
    },
    height: 'auto',
    displayEventTime: false,
    editable: true,
    eventStartEditable: true,
    eventDurationEditable: false,
    events: (info, success) => success(this.eventsFor(info.start, info.end)),
    eventDrop: (info) => this.onDrop(info.event.id, info.event.start, info.revert),
    eventClick: (info) => {
      const props = info.event.extendedProps as { kind?: string; termId?: number };
      if (props.kind === 'term' && props.termId !== undefined) {
        void this.router.navigate(['/planning/terms', props.termId]);
        return;
      }
      this.selectedId.set(Number(info.event.id));
    },
  };

  private eventsFor(start: Date, end: Date): EventInput[] {
    const out: EventInput[] = [];
    const from = isoDay(start);
    const to = isoDay(end);
    for (const s of this.allSessions()) {
      if (!s.planned_date) continue;
      if (s.planned_date < from || s.planned_date >= to) continue;
      const e = toCalEvent(s, this.i18n.instant(`sessionType.${s.session_type}`));
      if (e) out.push(e);
    }
    // One band per term overlapping the window (titles make terms visible).
    const loaded = this.detailsRes.value();
    if (loaded) {
      for (const t of loaded.terms) {
        const band = termBand(
          t.id,
          t.name_ar,
          this.allSessions()
            .filter((s) => s.term_id === t.id)
            .map((s) => s.planned_date)
            .filter((d): d is string => !!d),
        );
        if (!band) continue;
        const bs = typeof band.start === 'string' ? band.start : '';
        const be = typeof band.end === 'string' ? band.end : '';
        if (!bs || !be || be <= from || bs >= to) continue;
        out.push(band);
      }
    }
    return out;
  }

  protected pickSeason(v: number | null): void {
    this.pickedSeason.set(v);
  }

  protected setDate(id: number, iso: string | null): void {
    if (iso === null) return;
    this.patchDate(id, iso);
  }

  private onDrop(id: string | number, start: Date | null, revert: () => void): void {
    if (!start) {
      revert();
      return;
    }
    this.patchDate(Number(id), dateToISODate(start), revert);
  }

  private patchDate(id: number, iso: string, revert?: () => void): void {
    if (this.saving()) {
      revert?.();
      return;
    }
    this.saving.set(true);
    this.errorKey.set(null);
    this.planning.updateSession(id, { planned_date: iso }).subscribe({
      next: () => {
        this.saving.set(false);
        this.allSessions.update((rows) =>
          rows.map((r) => (r.id === id ? { ...r, planned_date: iso } : r)),
        );
        this.api()?.refetchEvents();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        revert?.();
        this.errorKey.set(apiErrorKey(err));
        // The detail picker already committed optimistically: reload truth.
        this.tick.update((n) => n + 1);
      },
    });
  }
}

/** Local-midnight yyyy-mm-dd for range filtering (matches stored shape). */
function isoDay(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
