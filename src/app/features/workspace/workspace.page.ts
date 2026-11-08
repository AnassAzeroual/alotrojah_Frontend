import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { CalendarService } from '../../core/api/calendar.service';
import { GroupResource, SessionResource, WeekResource } from '../../core/api/models';
import {
  SessionWorkspace,
  WorkspaceModule,
  WorkspaceService,
  WorkspaceStudent,
} from '../../core/api/workspace.service';
import { GroupsService } from '../../core/api/groups.service';
import {
  DropdownComponent,
  DropdownOption,
  DropdownValue,
  dropdownNumber,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { apiErrorKey } from '../../core/api/api-errors';

type NoteDraft = {
  note: string;
  tone: 'good' | 'focus' | 'neutral' | null;
  visibility: 'staff' | 'student';
};

@Component({
  selector: 'app-workspace-page',
  standalone: true,
  imports: [TranslatePipe, RouterLink, DropdownComponent, EmptyStateComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace.page.html',
  styleUrl: './workspace.page.scss',
})
export class WorkspacePage {
  private readonly groupsSvc = inject(GroupsService);
  private readonly calendar = inject(CalendarService);
  private readonly workspaceSvc = inject(WorkspaceService);
  private readonly sessionTick = signal(0);

  readonly groups = resource({
    params: () => ({}),
    loader: (): Promise<GroupResource[]> => this.groupsSvc.listAll(),
  });
  readonly selectedGroup = signal<number | null>(null);
  readonly selectedWeek = signal<number | null>(null);
  readonly selectedSession = signal<number | null>(null);
  readonly groupData = computed(
    () => (this.groups.value() ?? []).find((group) => group.id === this.selectedGroup()) ?? null,
  );

  readonly weeks = resource({
    params: () => ({ center: this.groupData()?.center_id ?? null }),
    loader: ({ params }): Promise<WeekResource[]> => {
      if (params.center === null) return Promise.resolve([]);
      return firstValueFrom(
        this.calendar.weeks({ center_id: params.center }).pipe(map((page) => page.data)),
      );
    },
  });

  readonly sessions = resource({
    params: () => ({
      group: this.selectedGroup(),
      week: this.selectedWeek(),
      tick: this.sessionTick(),
    }),
    loader: ({ params }): Promise<SessionResource[]> => {
      if (params.group === null || params.week === null) return Promise.resolve([]);
      return firstValueFrom(
        this.calendar
          .sessions({ group_id: params.group, week_id: params.week })
          .pipe(map((page) => page.data)),
      );
    },
  });

  readonly workspace = resource({
    params: () => ({ session: this.selectedSession() }),
    loader: ({ params }): Promise<SessionWorkspace | null> => {
      if (params.session === null) return Promise.resolve(null);
      const sessionId = params.session;
      return new Promise((resolve, reject) =>
        this.workspaceSvc.get(sessionId).subscribe({ next: resolve, error: reject }),
      );
    },
  });

  readonly drafts = signal<Record<string, string>>({});
  readonly noteDrafts = signal<Record<string, NoteDraft>>({});
  readonly attendanceDraft = signal<Record<number, string>>({});
  readonly dirty = signal(false);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly openNotesFor = signal<number | null>(null);

  readonly groupOptions = computed<DropdownOption[]>(() =>
    (this.groups.value() ?? []).map((group) => ({
      value: String(group.id),
      label: group.name,
    })),
  );

  readonly weekOptions = computed<DropdownOption[]>(() =>
    (this.weeks.value() ?? []).map((week) => ({
      value: String(week.id),
      label: `W${week.week_number_global} · ${week.term_name ?? ''}`,
    })),
  );

  readonly sessionOptions = computed<DropdownOption[]>(() =>
    (this.sessions.value() ?? []).map((session) => ({
      value: String(session.id),
      label: `S${session.session_number_global} · ${session.session_type} · ${session.planned_date ?? ''}`,
    })),
  );

  readonly canEditAny = computed(() => {
    const p = this.workspace.value()?.permissions;
    return !!p && (p.attendance || p.hifz || p.murajaa);
  });

  readonly openStudent = computed(
    () => this.workspace.value()?.students.find((s) => s.id === this.openNotesFor()) ?? null,
  );

  readonly noteModules = computed(() => this.workspace.value()?.modules ?? []);

  readonly showAdd = signal(false);
  readonly addWeekId = signal<number | null>(null);
  readonly addDate = signal('');
  readonly addStart = signal('16:00');
  readonly addEnd = signal('17:30');
  readonly addType = signal<'memorization' | 'revision' | 'exam'>('revision');
  readonly addError = signal<string | null>(null);
  readonly addSaving = signal(false);

  private readonly init = effect(() => {
    const groups = this.groups.value() ?? [];
    if (this.selectedGroup() === null && groups.length === 1) {
      this.selectedGroup.set(groups[0].id);
    }
  });

  private readonly initWeek = effect(() => {
    const weeks = this.weeks.value() ?? [];
    if (this.selectedWeek() !== null || weeks.length === 0) return;
    this.selectedWeek.set(weeks[0].id);
  });

  private readonly initSession = effect(() => {
    const sessions = this.sessions.value() ?? [];
    if (this.selectedSession() !== null || sessions.length === 0) return;
    const current = sessions.find((session) => session.status !== 'cancelled') ?? sessions[0];
    this.selectedSession.set(current.id);
  });

  private readonly hydrate = effect(() => {
    const workspace = this.workspace.value();
    if (!workspace) {
      this.drafts.set({});
      this.noteDrafts.set({});
      this.attendanceDraft.set({});
      return;
    }

    const scores: Record<string, string> = {};
    const notes: Record<string, NoteDraft> = {};
    const attendance: Record<number, string> = {};
    for (const student of workspace.students) {
      if (student.attendance) attendance[student.id] = student.attendance;
      for (const module of workspace.modules) {
        const score = student.scores[module.code];
        if (score !== undefined) scores[`${student.id}:${module.id}`] = String(score);
        const note = student.notes[module.code];
        if (note) {
          notes[`${student.id}:${module.code}`] = {
            note: note.note,
            tone: note.tone,
            visibility: note.visibility,
          };
        }
      }
    }
    this.drafts.set(scores);
    this.noteDrafts.set(notes);
    this.attendanceDraft.set(attendance);
    this.dirty.set(false);
    this.errorKey.set(null);
  });

  setGroup(value: DropdownValue): void {
    const id = dropdownNumber(value);
    if (id === this.selectedGroup()) return;
    this.selectedGroup.set(id);
    this.selectedWeek.set(null);
    this.selectedSession.set(null);
    this.dirty.set(false);
    this.saved.set(false);
  }

  setWeek(value: DropdownValue): void {
    const id = dropdownNumber(value);
    if (id === this.selectedWeek()) return;
    this.selectedWeek.set(id);
    this.selectedSession.set(null);
    this.dirty.set(false);
    this.saved.set(false);
  }

  setSession(value: DropdownValue): void {
    this.selectedSession.set(dropdownNumber(value));
    this.dirty.set(false);
    this.saved.set(false);
    this.errorKey.set(null);
  }

  scoreValue(student: WorkspaceStudent, module: WorkspaceModule): string {
    return this.drafts()[`${student.id}:${module.id}`] ?? '';
  }

  noteValue(student: WorkspaceStudent, module: WorkspaceModule): NoteDraft {
    return (
      this.noteDrafts()[`${student.id}:${module.code}`] ?? {
        note: '',
        tone: null,
        visibility: 'staff',
      }
    );
  }

  attendanceValue(student: WorkspaceStudent): string {
    return this.attendanceDraft()[student.id] ?? student.attendance ?? 'present';
  }

  setScore(student: WorkspaceStudent, module: WorkspaceModule, value: string): void {
    this.drafts.update((drafts) => ({
      ...drafts,
      [`${student.id}:${module.id}`]: value,
    }));
    this.touch();
  }

  setAttendance(student: WorkspaceStudent, value: DropdownValue): void {
    if (value === null || value === undefined) return;
    this.attendanceDraft.update((rows) => ({ ...rows, [student.id]: String(value) }));
    this.touch();
  }

  setNote(student: WorkspaceStudent, module: WorkspaceModule, note: string): void {
    const key = `${student.id}:${module.code}`;
    this.noteDrafts.update((rows) => ({
      ...rows,
      [key]: { ...this.noteValue(student, module), note },
    }));
    this.touch();
  }

  setTone(student: WorkspaceStudent, module: WorkspaceModule, tone: NoteDraft['tone']): void {
    const key = `${student.id}:${module.code}`;
    this.noteDrafts.update((rows) => ({
      ...rows,
      [key]: { ...this.noteValue(student, module), tone },
    }));
    this.touch();
  }

  setVisibility(
    student: WorkspaceStudent,
    module: WorkspaceModule,
    visibility: NoteDraft['visibility'],
  ): void {
    const key = `${student.id}:${module.code}`;
    this.noteDrafts.update((rows) => ({
      ...rows,
      [key]: { ...this.noteValue(student, module), visibility },
    }));
    this.touch();
  }

  noteCount(student: WorkspaceStudent): number {
    return Object.entries(this.noteDrafts()).filter(
      ([key, draft]) => key.startsWith(`${student.id}:`) && draft.note.trim() !== '',
    ).length;
  }

  canEdit(module: WorkspaceModule): boolean {
    const permissions = this.workspace.value()?.permissions;
    if (!permissions) return false;
    return module.scope === 'murajaa' ? permissions.murajaa : permissions.hifz;
  }

  scoreError(student: WorkspaceStudent, module: WorkspaceModule): boolean {
    const raw = this.scoreValue(student, module).trim();
    if (raw === '') return false;
    const n = Number(raw);
    return !Number.isFinite(n) || n < 0 || n > Number(module.max_points);
  }

  save(): void {
    const workspace = this.workspace.value();
    if (!workspace || this.saving() || !this.dirty()) return;

    for (const student of workspace.students) {
      for (const module of workspace.modules) {
        if (this.scoreError(student, module)) {
          this.errorKey.set('workspace.invalid_score');
          return;
        }
      }
    }

    const scores: Array<{ student_id: number; module_id: number; score: number | null }> = [];
    const notes: Array<{
      student_id: number;
      module_code: string;
      note: string;
      tone: NoteDraft['tone'];
      visibility: NoteDraft['visibility'];
    }> = [];
    const attendance: Array<{ student_id: number; status: string }> = [];

    for (const student of workspace.students) {
      if (
        workspace.permissions.attendance &&
        (this.attendanceDraft()[student.id] !== undefined || student.attendance !== null)
      ) {
        attendance.push({ student_id: student.id, status: this.attendanceValue(student) });
      }
      for (const module of workspace.modules) {
        if (this.canEdit(module)) {
          const raw = this.scoreValue(student, module).trim();
          scores.push({
            student_id: student.id,
            module_id: module.id,
            score: raw === '' ? null : Number(raw),
          });
        }
        const note = this.noteValue(student, module);
        const original = student.notes[module.code];
        if (
          note.note.trim() !== (original?.note ?? '') ||
          note.tone !== (original?.tone ?? null) ||
          note.visibility !== (original?.visibility ?? 'staff')
        ) {
          notes.push({
            student_id: student.id,
            module_code: module.code,
            note: note.note,
            tone: note.tone,
            visibility: note.visibility,
          });
        }
      }
    }

    this.saving.set(true);
    this.errorKey.set(null);
    this.workspaceSvc.save(workspace.session.id, { attendance, scores, notes }).subscribe({
      next: () => {
        this.saving.set(false);
        this.dirty.set(false);
        this.saved.set(true);
        this.workspace.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorKey.set(apiErrorKey(err));
      },
    });
  }

  openNotes(student: WorkspaceStudent): void {
    this.openNotesFor.set(student.id);
  }

  closeNotes(): void {
    this.openNotesFor.set(null);
  }

  openAdd(): void {
    const week = this.selectedWeek();
    if (week === null) return;
    this.addWeekId.set(week);
    this.addDate.set('');
    this.addError.set(null);
    this.showAdd.set(true);
  }

  closeAdd(): void {
    this.showAdd.set(false);
  }

  createSession(): void {
    const group = this.selectedGroup();
    const week = this.addWeekId();
    if (group === null || week === null || this.addSaving()) return;
    if (this.addDate() === '') {
      this.addError.set('workspace.date_required');
      return;
    }

    this.addSaving.set(true);
    this.addError.set(null);
    this.workspaceSvc
      .createSession(group, {
        week_id: week,
        planned_date: this.addDate(),
        start_time: this.addStart(),
        end_time: this.addEnd(),
        session_type: this.addType(),
      })
      .subscribe({
        next: (created) => {
          this.addSaving.set(false);
          this.showAdd.set(false);
          this.sessionTick.update((n) => n + 1);
          this.selectedSession.set(created.id);
        },
        error: (err: unknown) => {
          this.addSaving.set(false);
          this.addError.set(apiErrorKey(err));
        },
      });
  }

  readonly attendanceOptions: DropdownOption[] = [
    { value: 'present', labelKey: 'attendance.present' },
    { value: 'late', labelKey: 'attendance.late' },
    { value: 'absent', labelKey: 'attendance.absent' },
    { value: 'excused', labelKey: 'attendance.excused' },
  ];

  typeOptions: Array<{ value: 'memorization' | 'revision' | 'exam'; labelKey: string }> = [
    { value: 'memorization', labelKey: 'timeline.type_memorization' },
    { value: 'revision', labelKey: 'timeline.type_revision' },
    { value: 'exam', labelKey: 'timeline.type_exam' },
  ];

  protected setType(value: DropdownValue): void {
    const raw = String(value);
    if (raw === 'memorization' || raw === 'revision' || raw === 'exam') {
      this.addType.set(raw);
    }
  }

  private touch(): void {
    this.dirty.set(true);
    this.saved.set(false);
    this.errorKey.set(null);
  }
}
