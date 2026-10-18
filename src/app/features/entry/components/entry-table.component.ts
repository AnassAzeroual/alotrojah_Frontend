import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  resource,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EntryService } from '../../../core/api/entry.service';
import {
  AttendanceResource,
  AttendanceStatus,
  ScoreBySessionResponse,
  ScoringModuleResource,
  StudentResource,
  WeeklyGoalResource,
} from '../../../core/api/models';
import { ScoreInputComponent } from '../../../shared/ui/score-input/score-input.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { DropdownComponent, DropdownOption } from '../../../shared/ui/dropdown/dropdown.component';

const ATT_STATES: AttendanceStatus[] = ['present', 'late', 'absent', 'excused'];

interface ScoreCell {
  module: ScoringModuleResource;
  current: number | null;
}

interface RowForm {
  att: FormControl<AttendanceStatus>;
  scores: FormGroup<Record<string, FormControl<number | null>>>;
  mem: FormControl<number | null>;
  goal: FormGroup<{
    target: FormControl<string>;
    done: FormControl<boolean>;
  }>;
}

interface PartResult {
  ok: boolean;
  err?: unknown;
}

/**
 * One row per pupil as a nested reactive form: attendance + module scores +
 * memorized amount + total + weekly goal, with one save button for every row.
 * Validators mirror the server caps (scores 0..cap, memorized 0.01..99.99,
 * goal text 300) for instant feedback; the server stays the arbiter and its
 * row-indexed refusals flag the same cells. Replaces the attendance-grid /
 * score-sheet / goal-list trio with the same endpoints and semantics.
 */
@Component({
  selector: 'app-entry-table',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    SpinnerComponent,
    ScoreInputComponent,
    EmptyStateComponent,
    DropdownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry-table.component.html',
  styleUrl: './entry-table.component.scss',
})
export class EntryTableComponent {
  private readonly entry = inject(EntryService);

  readonly students = input.required<StudentResource[]>();
  readonly modules = input.required<ScoringModuleResource[]>();
  readonly scoreRows = input.required<ScoreBySessionResponse['data']>();
  readonly attendanceRows = input.required<AttendanceResource[]>();
  readonly sessionId = input.required<number | null>();
  readonly weekId = input.required<number | null>();
  /** Murajaa teachers: scores off, attendance + goal stay on. */
  readonly disabledAll = input(false);
  /** Show the per-pupil memorized-amount column (memorization sessions only). */
  readonly showMemorization = input(false);
  /** Level-expected thumn/session default per pupil, when one exists. */
  readonly defaultMemorization = input<(studentId: number) => number | null>(() => null);
  readonly saved = output<void>();

  readonly form = new FormGroup<Record<string, FormGroup<RowForm>>>({});

  /** Weekly-scope modules only; murajaa module lives in review cycles. Inactive = grayed. */
  readonly sheetModules = computed(() => this.modules().filter((m) => m.scope === 'weekly'));

  readonly attOptions: DropdownOption[] = ATT_STATES.map((s) => ({
    value: s,
    labelKey: `attendance.${s}`,
  }));

  private readonly attMap = computed(() => {
    const m = new Map<number, AttendanceResource>();
    for (const r of this.attendanceRows()) m.set(r.student_id, r);
    return m;
  });

  private readonly existingMap = computed(() => {
    const m = new Map<string, number>();
    for (const row of this.scoreRows()) {
      for (const s of row.scores) {
        if (s.module) m.set(`${row.student_id}:${s.module.code}`, s.score);
      }
    }
    return m;
  });

  private readonly tick = signal(0);
  /**
   * Form state is not a signal: every template reader touches this so the
   * view refreshes on edits, saves and server reloads. Written only by event
   * handlers, subscribe callbacks and effects — never during view evaluation.
   */
  private readonly bump = signal(0);
  private readonly goals = resource({
    params: () => ({ w: this.weekId(), t: this.tick() }),
    loader: ({ params }) =>
      params.w === null
        ? Promise.resolve<WeeklyGoalResource[]>([])
        : firstValueFrom(this.entry.goals({ week_id: params.w }).pipe(map((p) => p.data))),
  });

  private readonly goalMap = computed(() => {
    const m = new Map<number, WeeklyGoalResource>();
    for (const g of this.goals.value() ?? []) m.set(g.student_id, g);
    return m;
  });

  // --- row groups (created lazily, pruned + patched by effects below) ---
  rowGroup(id: number): FormGroup<RowForm> {
    const key = String(id);
    const existing = this.form.get(key) as FormGroup<RowForm> | null;
    if (existing) {
      this.ensureRowModules(existing, id);
      return existing;
    }
    const created = this.buildRow(key);
    (this.form as FormGroup).addControl(key, created);
    return created;
  }

  private pupilOf(key: string): StudentResource | undefined {
    return this.students().find((s) => String(s.id) === key);
  }

  private buildRow(key: string): FormGroup<RowForm> {
    const st = this.pupilOf(key);
    const sid = st?.id ?? 0;
    const scores: Record<string, FormControl<number | null>> = {};
    for (const m of this.sheetModules()) {
      scores[m.code] = new FormControl<number | null>(
        this.existingMap().get(`${sid}:${m.code}`) ?? null,
        { validators: [Validators.min(0), Validators.max(m.max_points)] },
      );
    }
    const goal = this.goalMap().get(sid);
    return new FormGroup<RowForm>({
      att: new FormControl<AttendanceStatus>(this.attMap().get(sid)?.status ?? 'present', {
        nonNullable: true,
      }),
      scores: new FormGroup(scores),
      mem: new FormControl<number | null>(st ? this.defaultMemorization()(st.id) : null, {
        validators: [Validators.min(0.01), Validators.max(99.99)],
      }),
      goal: new FormGroup({
        target: new FormControl<string>(goal?.target_text ?? '', {
          nonNullable: true,
          validators: [Validators.maxLength(300)],
        }),
        done: new FormControl<boolean>(goal?.is_completed ?? false, { nonNullable: true }),
      }),
    });
  }

  /** New modules (center-set edits) gain controls; dropped ones lose them. */
  private ensureRowModules(g: FormGroup<RowForm>, sid: number): void {
    const group = g.controls.scores as FormGroup;
    for (const m of this.sheetModules()) {
      if (!group.get(m.code)) {
        group.addControl(
          m.code,
          new FormControl<number | null>(this.existingMap().get(`${sid}:${m.code}`) ?? null, {
            validators: [Validators.min(0), Validators.max(m.max_points)],
          }),
        );
      }
    }
    for (const code of Object.keys(group.controls)) {
      if (!this.sheetModules().some((m) => m.code === code)) group.removeControl(code);
    }
  }

  attCtrl(id: number): FormControl<AttendanceStatus> {
    this.bump();
    return this.rowGroup(id).controls.att;
  }

  scoreCtrl(id: number, code: string): FormControl<number | null> {
    this.bump();
    return this.rowGroup(id).controls.scores.controls[code];
  }

  memCtrl(id: number): FormControl<number | null> {
    this.bump();
    return this.rowGroup(id).controls.mem;
  }

  goalTargetCtrl(id: number): FormControl<string> {
    this.bump();
    return this.rowGroup(id).controls.goal.controls.target;
  }

  goalDoneCtrl(id: number): FormControl<boolean> {
    this.bump();
    return this.rowGroup(id).controls.goal.controls.done;
  }

  constructor() {
    // Drop groups for pupils that left the list (session/group switch).
    effect(() => {
      const ids = new Set(this.students().map((s) => String(s.id)));
      this.sessionId();
      for (const key of Object.keys(this.form.controls)) {
        if (!ids.has(key)) (this.form as FormGroup).removeControl(key);
      }
    });
    // A week switch drops every goal editor (dirty included): unsaved text
    // must never travel between weeks (§2.20) and save into the wrong one.
    effect(() => {
      const w = this.weekId();
      if (this.lastWeek !== undefined && w !== this.lastWeek) {
        let reset = false;
        for (const st of this.students()) {
          const g = this.form.get(String(st.id)) as FormGroup<RowForm> | null;
          if (!g) continue;
          const srv = this.goalMap().get(st.id);
          g.controls.goal.setValue({
            target: srv?.target_text ?? '',
            done: srv?.is_completed ?? false,
          });
          g.controls.goal.markAsPristine();
          reset = true;
        }
        if (reset) this.bump.update((n) => n + 1);
      }
      this.lastWeek = w;
    });
    // Server truth flows into pristine controls only — user edits always win.
    effect(() => {
      const sts = this.students();
      this.scoreRows();
      this.attendanceRows();
      this.goalMap();
      let patched = false;
      for (const st of sts) {
        const g = this.rowGroup(st.id);
        const att = this.attMap().get(st.id)?.status ?? 'present';
        if (g.controls.att.pristine && g.controls.att.value !== att) {
          g.controls.att.setValue(att);
          patched = true;
        }
        for (const m of this.sheetModules()) {
          const c = g.controls.scores.controls[m.code];
          if (c?.pristine) {
            const v = this.existingMap().get(`${st.id}:${m.code}`) ?? null;
            if (c.value !== v) {
              c.setValue(v);
              patched = true;
            }
          }
        }
        if (g.controls.mem.pristine) {
          const v = this.defaultMemorization()(st.id);
          if (g.controls.mem.value !== v) {
            g.controls.mem.setValue(v);
            patched = true;
          }
        }
        const gg = this.goalMap().get(st.id);
        const gc = g.controls.goal;
        if (gc.pristine) {
          const t = gg?.target_text ?? '';
          const d = gg?.is_completed ?? false;
          if (gc.controls.target.value !== t || gc.controls.done.value !== d) {
            gc.setValue({ target: t, done: d });
            patched = true;
          }
        }
      }
      if (patched) this.bump.update((n) => n + 1);
    });
  }

  // --- compatibility readers (specs + template) ---
  attStatus(id: number): AttendanceStatus {
    this.bump();
    return this.rowGroup(id).controls.att.value;
  }

  setStatus(id: number, status: AttendanceStatus): void {
    const c = this.attCtrl(id);
    c.setValue(status);
    c.markAsDirty();
    this.bump.update((n) => n + 1);
    if (this.attBad().has(id)) {
      this.attBad.update((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      this.clearRowErrorIfClean(id);
    }
  }

  cellsFor(student: StudentResource): ScoreCell[] {
    this.bump();
    return this.sheetModules().map((mod) => ({
      module: mod,
      current: this.scoreCtrl(student.id, mod.code)?.value ?? null,
    }));
  }

  totalFor(student: StudentResource): number | null {
    this.bump();
    const counted = this.cellsFor(student).filter(
      (c) => c.module.is_active && c.module.is_in_weekly_total && c.current !== null,
    );
    return counted.length > 0
      ? Math.round(counted.reduce((a, c) => a + (c.current ?? 0), 0) * 10) / 10
      : null;
  }

  /** Effective memorized amount for a pupil (prefill default until edited). */
  memorizedFor(studentId: number): number | null {
    return this.memCtrl(studentId).value ?? this.defaultMemorization()(studentId);
  }

  setScore(studentId: number, code: string, value: number | null): void {
    const key = `${studentId}:${code}`;
    const c = this.scoreCtrl(studentId, code);
    if (!c) return;
    c.setValue(value);
    c.markAsDirty();
    this.bump.update((n) => n + 1);
    if (this.badCells().get(studentId)?.has(key)) {
      this.badCells.update((m) => {
        const next = new Map(m);
        const set = new Set(next.get(studentId) ?? []);
        set.delete(key);
        if (set.size === 0) next.delete(studentId);
        else next.set(studentId, set);
        return next;
      });
      this.clearRowErrorIfClean(studentId);
    }
  }

  /** Explicit memorized amount (null = blank → remove the session log). */
  setMemorized(studentId: number, value: number | null): void {
    const c = this.memCtrl(studentId);
    c.setValue(value);
    c.markAsDirty();
    this.bump.update((n) => n + 1);
    this.clearRowErrorIfClean(studentId);
  }

  goalTarget(id: number): string {
    this.bump();
    return this.goalTargetCtrl(id).value;
  }

  goalDone(id: number): boolean {
    this.bump();
    return this.goalDoneCtrl(id).value;
  }

  editGoal(id: number, patch: Partial<{ target: string; done: boolean }>): void {
    const g = this.rowGroup(id).controls.goal;
    g.patchValue(patch);
    g.markAsDirty();
    this.bump.update((n) => n + 1);
    this.onFieldEdit(id);
  }

  /** A native-bound input was edited (mem / goal text / goal done): drop the
   *  goal flag so it can re-fire, and bump so `anyDirty`/`rowTouched` re-read
   *  the raw form state - form state is not a signal, so without the bump the
   *  save button never re-enables after typing a goal or memorized value. */
  onFieldEdit(id: number): void {
    if (this.goalBad().has(id)) {
      this.goalBad.update((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
    this.clearRowErrorIfClean(id);
    this.bump.update((n) => n + 1);
  }

  showScoreError(id: number, code: string): boolean {
    this.bump();
    if (this.badCells().get(id)?.has(`${id}:${code}`)) return true;
    const c = this.scoreCtrl(id, code);
    return !!c && c.invalid && c.dirty;
  }

  // --- table save: one button persists every dirty row ---
  private lastWeek: number | null | undefined = undefined;
  readonly savingAll = signal(false);
  /** Refused score cells per pupil (`studentId:moduleCode`). */
  readonly badCells = signal<ReadonlyMap<number, ReadonlySet<string>>>(new Map());
  private readonly attBad = signal<ReadonlySet<number>>(new Set());
  private readonly goalBad = signal<ReadonlySet<number>>(new Set());
  /** Static banner key per failed pupil (cell details ride the cells). */
  readonly rowError = signal<ReadonlyMap<number, string>>(new Map());

  /** A pupil with user-made unsent edits (drives the yellow rows + save-all). */
  rowTouched(id: number): boolean {
    this.bump();
    return this.rowGroup(id).dirty;
  }

  /** Any listed pupil with unsent edits. */
  readonly anyDirty = computed(() => {
    this.bump();
    return this.students().some(
      (s) => (this.form.get(String(s.id)) as FormGroup<RowForm> | null)?.dirty,
    );
  });

  private clearRowErrorIfClean(id: number): void {
    if (
      !this.attBad().has(id) &&
      !this.goalBad().has(id) &&
      (this.badCells().get(id)?.size ?? 0) === 0
    ) {
      this.rowError.update((m) => {
        if (!m.has(id)) return m;
        const next = new Map(m);
        next.delete(id);
        return next;
      });
    }
  }

  /** Server row-indexed `records.N.<field>` errors → `studentId:moduleCode` cells. */
  private badCellsFrom(
    err: unknown,
    sent: { student_id: number; module_code: string }[],
  ): Set<string> {
    const out = new Set<string>();
    const bag =
      err instanceof HttpErrorResponse
        ? ((err.error as { errors?: unknown } | null)?.errors ?? null)
        : null;
    if (!bag || typeof bag !== 'object') return out;
    for (const key of Object.keys(bag)) {
      const m = /^records\.(\d+)\.(score|module_code|student_id)$/.exec(key);
      if (!m) continue;
      const row = sent[Number(m[1])];
      if (row) out.add(`${row.student_id}:${row.module_code}`);
    }
    return out;
  }

  saveAll(): void {
    const sid = this.sessionId();
    if (sid === null || this.savingAll()) return;
    const pupils = this.students();
    const jobs: Record<string, Observable<PartResult>> = {};

    const attRecs = pupils
      .filter((s) => this.rowGroup(s.id).controls.att.dirty)
      .map((s) => ({ student_id: s.id, status: this.rowGroup(s.id).controls.att.value }));
    if (attRecs.length > 0) {
      jobs['att'] = this.entry.attendanceBulk(sid, attRecs).pipe(
        map((): PartResult => ({ ok: true })),
        catchError((err: unknown) => of({ ok: false, err })),
      );
    }

    let sentScores: { student_id: number; module_code: string }[] = [];
    let memIds: number[] = [];
    if (!this.disabledAll()) {
      const records: { student_id: number; module_code: string; score: number }[] = [];
      for (const s of pupils) {
        const g = this.rowGroup(s.id);
        for (const code of Object.keys(g.controls.scores.controls)) {
          const c = g.controls.scores.controls[code];
          if (c.dirty && c.value !== null) {
            records.push({ student_id: s.id, module_code: code, score: c.value });
          }
        }
      }
      // A touched scores part still carries every listed pupil's memorized
      // amount (pre-filled defaults included), like the old section save.
      const memTouched = pupils.some((s) => this.rowGroup(s.id).controls.mem.dirty);
      const mem =
        this.showMemorization() && (records.length > 0 || memTouched)
          ? pupils.map((st) => ({ student_id: st.id, thumn_amount: this.memorizedFor(st.id) }))
          : [];
      if (records.length > 0 || mem.length > 0) {
        sentScores = records;
        memIds = mem.map((m) => m.student_id);
        jobs['scores'] = this.entry.scoresBulk(sid, records, mem).pipe(
          map((): PartResult => ({ ok: true })),
          catchError((err: unknown) => of({ ok: false, err })),
        );
      }
    }

    const wid = this.weekId();
    const goalIds: number[] = [];
    if (wid !== null) {
      for (const s of pupils) {
        const g = this.rowGroup(s.id).controls.goal;
        if (!g.dirty) continue;
        goalIds.push(s.id);
        const target = g.controls.target.value;
        const done = g.controls.done.value;
        jobs[`goal:${s.id}`] = this.entry.upsertGoal(s.id, wid, target || null, done).pipe(
          map((): PartResult => ({ ok: true })),
          catchError((err: unknown) => of({ ok: false, err })),
        );
      }
    }

    if (Object.keys(jobs).length === 0) return;
    const touched = new Set<number>([
      ...attRecs.map((r) => r.student_id),
      ...sentScores.map((r) => r.student_id),
      ...memIds,
      ...goalIds,
    ]);
    this.rowError.update((m) => {
      const next = new Map(m);
      for (const id of touched) next.delete(id);
      return next;
    });
    this.savingAll.set(true);
    forkJoin(jobs).subscribe((res) => {
      let anyOk = false;
      const att = res['att'];
      if (att) {
        if (att.ok) {
          for (const r of attRecs) {
            const g = this.form.get(String(r.student_id)) as FormGroup<RowForm> | null;
            g?.controls.att.markAsPristine();
          }
          this.attBad.update((s) => {
            const next = new Set(s);
            for (const r of attRecs) next.delete(r.student_id);
            return next;
          });
          anyOk = true;
        } else {
          this.attBad.update((s) => {
            const next = new Set(s);
            for (const r of attRecs) next.add(r.student_id);
            return next;
          });
        }
      }
      const sco = res['scores'];
      if (sco) {
        const scoreIds = new Set<number>([...sentScores.map((r) => r.student_id), ...memIds]);
        if (sco.ok) {
          for (const id of scoreIds) {
            const g = this.form.get(String(id)) as FormGroup<RowForm> | null;
            if (!g) continue;
            for (const code of Object.keys(g.controls.scores.controls)) {
              g.controls.scores.controls[code].markAsPristine();
            }
            g.controls.mem.markAsPristine();
          }
          this.badCells.update((m) => {
            const next = new Map(m);
            for (const id of scoreIds) next.delete(id);
            return next;
          });
          anyOk = true;
        } else {
          const cells = this.badCellsFrom(sco.err, sentScores);
          this.badCells.update((m) => {
            const next = new Map(m);
            for (const key of cells) {
              const pid = Number(key.slice(0, key.indexOf(':')));
              const set = new Set(next.get(pid) ?? []);
              set.add(key);
              next.set(pid, set);
            }
            return next;
          });
        }
      }
      let goalsOk = false;
      for (const gid of goalIds) {
        const gol = res[`goal:${gid}`];
        if (!gol) continue;
        const g = this.form.get(String(gid)) as FormGroup<RowForm> | null;
        if (gol.ok) {
          g?.controls.goal.markAsPristine();
          this.goalBad.update((s) => {
            const next = new Set(s);
            next.delete(gid);
            return next;
          });
          goalsOk = true;
        } else {
          this.goalBad.update((s) => new Set(s).add(gid));
        }
      }
      if (goalsOk) {
        this.tick.update((n) => n + 1);
        anyOk = true;
      }
      for (const id of touched) {
        if (
          this.attBad().has(id) ||
          this.goalBad().has(id) ||
          (this.badCells().get(id)?.size ?? 0) > 0
        ) {
          this.rowError.update((m) => new Map(m).set(id, 'entry.save_failed'));
        }
      }
      this.savingAll.set(false);
      this.bump.update((n) => n + 1);
      // Refresh server truth; refused edits stay on top of it.
      if (anyOk) this.saved.emit();
    });
  }
}
