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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, forkJoin, map } from 'rxjs';
import { CalendarService } from '../../core/api/calendar.service';
import { EntryService, SessionStudentScores, AttendanceRow } from '../../core/api/entry.service';
import { GroupsService } from '../../core/api/groups.service';
import { LevelsService } from '../../core/api/levels.service';
import { StudentsService } from '../../core/api/students.service';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { EntryTableComponent } from './components/entry-table.component';

@Component({
  selector: 'app-entry-page',
  standalone: true,
  imports: [TranslatePipe, DropdownComponent, EmptyStateComponent, EntryTableComponent],
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
  private readonly i18n = inject(TranslateService);
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

  protected readonly num = dropdownNumber;
  protected readonly txt = dropdownText;

  readonly selectedGroup = signal<number | null>(null);
  readonly selectedWeek = signal<number | null>(null);
  readonly selectedSession = signal<number | null>(null);
  readonly savedTick = signal(0);

  /** Manual picks stick: auto-pick only fires for untouched controls. */
  private readonly touched = { group: false, week: false, session: false };

  private static todayLocal(): string {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  constructor() {
    // Smart defaults (user-requested 2026-10-17): a teacher with a single
    // group gets it preselected; the week holding today is preselected;
    // today's session of that group (if any) is preselected. Everything
    // remains overridable — manual picks are never clobbered.
    effect(() => {
      if (!this.touched.group && this.selectedGroup() === null && this.groups().length === 1) {
        this.selectedGroup.set(this.groups()[0].id);
      }
      if (
        !this.touched.week &&
        this.selectedWeek() === null &&
        (this.weeks.value() ?? []).length > 0
      ) {
        const today = EntryPage.todayLocal();
        const current = (this.weeks.value() ?? []).find(
          (w) =>
            w.start_date !== null &&
            w.end_date !== null &&
            w.start_date <= today &&
            today <= w.end_date,
        );
        if (current) this.selectedWeek.set(current.id);
      }
      if (
        !this.touched.session &&
        this.selectedSession() === null &&
        this.selectedGroup() !== null &&
        (this.sessions.value() ?? []).length > 0
      ) {
        const today = EntryPage.todayLocal();
        const todays = (this.sessions.value() ?? []).find(
          (s) => s.group_id === this.selectedGroup() && s.planned_date === today,
        );
        if (todays) this.selectedSession.set(todays.id);
      }
    });
  }

  readonly isMurajaa = computed(() => this.auth.currentUser()?.teacher_type === 'murajaa');

  private dash(): string {
    this.language.current();
    return '—';
  }

  readonly groupOptions = computed<DropdownOption[]>(() => [
    { value: '', label: this.dash() },
    ...this.groups().map((g) => ({ value: String(g.id), label: g.name })),
  ]);
  readonly weekOptions = computed<DropdownOption[]>(() => [
    { value: '', label: this.dash() },
    ...(this.weeks.value() ?? []).map((w) => ({
      value: String(w.id),
      label:
        `${this.i18n.instant('common.week')} ${w.week_number_global}` +
        (w.term_name ? ` · ${w.term_name}` : '') +
        (w.season_name ? ` · (${w.season_name})` : ''),
    })),
  ]);
  readonly sessionOptions = computed<DropdownOption[]>(() => [
    { value: '', label: this.dash() },
    ...(this.sessions.value() ?? []).map((s) => ({
      value: String(s.id),
      label: `${this.i18n.instant('common.session')} ${s.session_number_global}`,
    })),
  ]);

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

  readonly scoreRows = computed((): SessionStudentScores[] => this.existing.value()?.scores ?? []);
  readonly attendanceRows = computed(
    (): AttendanceRow[] => this.existing.value()?.attendance ?? [],
  );
  readonly ready = computed(() => this.selectedGroup() !== null && this.selectedSession() !== null);

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

  onGroup(id: number | null): void {
    this.touched.group = true;
    this.selectedGroup.set(id);
    this.selectedSession.set(null);
  }

  onWeek(id: number | null): void {
    this.touched.week = true;
    this.selectedWeek.set(id);
    this.selectedSession.set(null);
  }

  onSession(id: number | null): void {
    this.touched.session = true;
    this.selectedSession.set(id);
  }

  onSaved(): void {
    this.savedTick.update((n) => n + 1);
  }
}
