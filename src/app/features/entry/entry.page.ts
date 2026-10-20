import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, forkJoin, map } from 'rxjs';
import { CalendarService } from '../../core/api/calendar.service';
import { EntryService } from '../../core/api/entry.service';
import { GroupsService } from '../../core/api/groups.service';
import { LevelsService } from '../../core/api/levels.service';
import {
  AttendanceResource,
  ScoreBySessionResponse,
  SessionResource,
  WeekResource,
} from '../../core/api/models';
import { StudentsService } from '../../core/api/students.service';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { EntryTableComponent } from './components/entry-table.component';

const WEEKDAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

@Component({
  selector: 'app-entry-page',
  standalone: true,
  imports: [TranslatePipe, EmptyStateComponent, EntryTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry.page.html',
  styleUrl: './entry.page.scss',
})
export class EntryPage {
  private readonly groupsSvc = inject(GroupsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly calendarSvc = inject(CalendarService);
  private readonly entry = inject(EntryService);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  private readonly levelsSvc = inject(LevelsService);

  readonly groups = toSignal(this.groupsSvc.list().pipe(map((p) => p.data)), { initialValue: [] });
  readonly modules = toSignal(this.entry.modules(), { initialValue: [] });
  /**
   * Center-scoped weeks: the picked group's center fixes the working season
   * (that center's current-season lane). Unpicked → unfiltered, so the boot
   * request and every other caller keep the old shape.
   */
  readonly weeks = resource({
    params: () => ({ g: this.selectedGroup() }),
    loader: ({ params }) => {
      const centerId =
        params.g === null ? undefined : this.groups().find((g) => g.id === params.g)?.center_id;
      return firstValueFrom(
        this.calendarSvc
          .weeks(centerId === undefined ? undefined : { center_id: centerId })
          .pipe(map((p) => p.data)),
      );
    },
  });
  readonly levels = toSignal(this.levelsSvc.list(), { initialValue: [] });

  readonly selectedGroup = signal<number | null>(null);
  readonly selectedWeek = signal<number | null>(null);
  readonly selectedSession = signal<number | null>(null);
  readonly savedTick = signal(0);

  readonly weekList = computed(() => this.weeks.value() ?? []);
  readonly weekTerms = computed(() => [
    ...new Set(
      this.weekList()
        .map((w) => w.term_name)
        .filter((term): term is string => term !== null && term !== ''),
    ),
  ]);
  /** null = auto-pick the current week's term; see visibleWeeks. */
  private readonly weekFilter = signal<string | null>(null);
  private readonly allWeeks = signal(false);
  readonly activeWeekTerm = computed<string | null>(() => {
    if (this.allWeeks()) return null;
    const explicit = this.weekFilter();
    if (explicit !== null) return explicit;
    const current = this.weekList().find((w) => this.isCurrentWeek(w));
    return current?.term_name ?? this.weekTerms()[0] ?? null;
  });
  readonly visibleWeeks = computed(() => {
    const term = this.activeWeekTerm();
    return term === null ? this.weekList() : this.weekList().filter((w) => w.term_name === term);
  });
  readonly selectedGroupData = computed(
    () => this.groups().find((g) => g.id === this.selectedGroup()) ?? null,
  );
  readonly selectedWeekData = computed(
    () => this.weekList().find((w) => w.id === this.selectedWeek()) ?? null,
  );
  readonly step = computed(() => {
    if (this.selectedGroup() === null) return 1;
    if (this.selectedWeek() === null) return 2;
    if (this.selectedSession() === null) return 3;
    return 4;
  });

  /** Back to the top of the card flow; the lone-group default must not refire. */
  private touchedGroup = false;

  private static todayLocal(): string {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  constructor() {
    // Only the lone-group shortcut survives the card flow. Weeks and sessions
    // stay explicit so their cards are always visible before the score sheet.
    effect(() => {
      if (!this.touchedGroup && this.selectedGroup() === null && this.groups().length === 1) {
        this.selectedGroup.set(this.groups()[0].id);
      }
    });
  }

  readonly isMurajaa = computed(() => this.auth.currentUser()?.teacher_type === 'murajaa');

  readonly students = resource({
    params: () => ({ g: this.selectedGroup(), t: this.savedTick() }),
    loader: ({ params }) =>
      params.g === null
        ? Promise.resolve([])
        : firstValueFrom(this.studentsSvc.list({ group_id: params.g }).pipe(map((p) => p.data))),
  });

  readonly sessions = resource({
    params: () => ({ w: this.selectedWeek(), g: this.selectedGroup() }),
    loader: ({ params }) =>
      params.w === null
        ? Promise.resolve([])
        : firstValueFrom(
            this.calendarSvc
              .sessions(
                params.g === null
                  ? { week_id: params.w }
                  : { week_id: params.w, group_id: params.g },
              )
              .pipe(map((p) => p.data)),
          ),
  });

  readonly sessionList = computed(() => this.sessions.value() ?? []);

  readonly existing = resource({
    params: () => ({ s: this.selectedSession(), t: this.savedTick() }),
    loader: ({ params }) => {
      if (params.s === null) return Promise.resolve({ scores: [], attendance: [] });
      return firstValueFrom(
        forkJoin({
          scores: this.entry.sessionScores(params.s),
          attendance: this.entry.attendanceList({ session_id: params.s }).pipe(map((p) => p.data)),
        }),
      );
    },
  });

  readonly scoreRows = computed(
    (): ScoreBySessionResponse['data'] => this.existing.value()?.scores ?? [],
  );
  readonly attendanceRows = computed(
    (): AttendanceResource[] => this.existing.value()?.attendance ?? [],
  );
  readonly ready = computed(
    () =>
      this.selectedGroup() !== null &&
      this.selectedWeek() !== null &&
      this.selectedSession() !== null,
  );

  /** §B: the picked session (type drives the memorized-amount field). */
  readonly session = computed(
    () => this.sessions.value()?.find((s) => s.id === this.selectedSession()) ?? null,
  );
  readonly showMemorization = computed(() => this.session()?.session_type === 'memorization');

  /** §B: level-expected memorized amount per pupil (memorization sessions only).
   * Arrow property, not a method: the template hands the reference itself to
   * the score sheet, which would unbind `this` on a plain method. */
  readonly defaultMemorization = (studentId: number): number | null => {
    const st = this.students.value()?.find((s) => s.id === studentId);
    if (!st?.level_id) return null;
    return this.levels().find((l) => l.id === st.level_id)?.thumn_per_session_value ?? null;
  };

  onGroup(id: number): void {
    this.touchedGroup = true;
    this.selectedGroup.set(id);
    this.selectedWeek.set(null);
    this.selectedSession.set(null);
    this.allWeeks.set(false);
    this.weekFilter.set(null);
  }

  onWeek(id: number): void {
    this.selectedWeek.set(id);
    this.selectedSession.set(null);
  }

  onSession(id: number): void {
    this.selectedSession.set(id);
  }

  /** Term chips narrow the week grid without changing the chosen section. */
  selectWeekTerm(term: string): void {
    this.allWeeks.set(false);
    this.weekFilter.set(term);
  }

  showAllWeeks(): void {
    this.allWeeks.set(true);
    this.weekFilter.set(null);
  }

  /** Breadcrumb “Sections”: clear every pick and return to the class cards. */
  resetGroup(): void {
    this.touchedGroup = true;
    this.selectedGroup.set(null);
    this.selectedWeek.set(null);
    this.selectedSession.set(null);
    this.allWeeks.set(false);
    this.weekFilter.set(null);
  }

  /** Breadcrumb group name: keep the section and show its week cards again. */
  backToWeeks(): void {
    if (this.selectedWeek() === null) return;
    this.selectedWeek.set(null);
    this.selectedSession.set(null);
  }

  /** Breadcrumb week: keep section + week and show the session cards again. */
  backToSessions(): void {
    if (this.selectedSession() === null) return;
    this.selectedSession.set(null);
  }

  onSaved(): void {
    this.savedTick.update((n) => n + 1);
  }

  protected scheduleKeys(days: string | null | undefined): string[] {
    if (!days) return [];
    return days
      .split(',')
      .map((d) => d.trim())
      .filter((d) => (WEEKDAY_KEYS as readonly string[]).includes(d));
  }

  protected isCurrentWeek(week: WeekResource): boolean {
    const today = EntryPage.todayLocal();
    return (
      week.start_date !== null &&
      week.end_date !== null &&
      week.start_date <= today &&
      today <= week.end_date
    );
  }

  protected isToday(date: string | null | undefined): boolean {
    return date === EntryPage.todayLocal();
  }

  protected formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(this.intlLocale(), {
      day: 'numeric',
      month: 'short',
    }).format(date);
  }

  protected formatRange(start: string | null, end: string | null): string {
    if (start === null && end === null) return '—';
    if (start === null) return this.formatDate(end);
    if (end === null) return this.formatDate(start);
    return `${this.formatDate(start)} – ${this.formatDate(end)}`;
  }

  protected sessionTime(session: SessionResource): string | null {
    const start = session.start_time?.slice(0, 5) ?? null;
    const end = session.end_time?.slice(0, 5) ?? null;
    if (start === null && end === null) return null;
    if (start === null) return `– ${end}`;
    return end === null ? start : `${start} – ${end}`;
  }

  private intlLocale(): string {
    switch (this.language.current()) {
      case 'ar':
        return 'ar-MA';
      case 'fr':
        return 'fr-FR';
      default:
        return 'en-GB';
    }
  }
}
