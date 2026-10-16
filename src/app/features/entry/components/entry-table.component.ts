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
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ScoringModule, SessionScore, Student } from '../../../core/api/api-models';
import {
  AttendanceRow,
  EntryService,
  SessionStudentScores,
  WeeklyGoal,
} from '../../../core/api/entry.service';
import { DropdownComponent, DropdownOption } from '../../../shared/ui/dropdown/dropdown.component';
import { ScoreInputComponent } from '../../../shared/ui/score-input/score-input.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

type AttStatus = 'present' | 'late' | 'absent' | 'excused';
const ATT_STATES: AttStatus[] = ['present', 'late', 'absent', 'excused'];

interface ScoreCell {
  module: ScoringModule;
  current: number | null;
}

interface PartResult {
  ok: boolean;
  err?: unknown;
}

/**
 * One row per pupil: attendance + module scores + memorized amount + total +
 * weekly goal, with a single per-row save (attendance bulk, scores bulk and
 * goal upsert fire in parallel for that pupil only; each part commits or
 * flags independently). Replaces the attendance-grid / score-sheet /
 * goal-list trio with the same endpoints and the same per-part semantics.
 */
@Component({
  selector: 'app-entry-table',
  standalone: true,
  imports: [
    FormsModule,
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

  readonly students = input.required<Student[]>();
  readonly modules = input.required<ScoringModule[]>();
  readonly scoreRows = input.required<SessionStudentScores[]>();
  readonly attendanceRows = input.required<AttendanceRow[]>();
  readonly sessionId = input.required<number | null>();
  readonly weekId = input.required<number | null>();
  /** Murajaa teachers: scores off, attendance + goal stay on. */
  readonly disabledAll = input(false);
  /** Show the per-pupil memorized-amount column (memorization sessions only). */
  readonly showMemorization = input(false);
  /** Level-expected thumn/session default per pupil, when one exists. */
  readonly defaultMemorization = input<(studentId: number) => number | null>(() => null);
  readonly saved = output<void>();

  // --- attendance state (ex-grid) ---
  private readonly attEdits = signal<ReadonlyMap<number, AttStatus>>(new Map());
  private readonly attMap = computed(() => {
    const m = new Map<number, AttendanceRow>();
    for (const r of this.attendanceRows()) m.set(r.student_id, r);
    return m;
  });
  private readonly attBad = signal<ReadonlySet<number>>(new Set());

  attStatus(id: number): AttStatus {
    return this.attEdits().get(id) ?? this.attMap().get(id)?.status ?? 'present';
  }

  attRecordId(id: number): number | null {
    return this.attMap().get(id)?.id ?? null;
  }

  setStatus(id: number, status: AttStatus): void {
    this.attEdits.update((m) => new Map(m).set(id, status));
    if (this.attBad().has(id)) {
      this.attBad.update((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      this.clearRowErrorIfClean(id);
    }
  }

  clearAttendance(id: number): void {
    const recordId = this.attRecordId(id);
    if (recordId === null || this.rowSaving().has(id)) return;
    this.rowSaving.update((s) => new Set(s).add(id));
    this.entry.deleteAttendance(recordId).subscribe({
      next: () => {
        this.attEdits.update((m) => {
          const next = new Map(m);
          next.delete(id);
          return next;
        });
        this.rowSaving.update((s) => {
          const next = new Set(s);
          next.delete(id);
          return next;
        });
        this.saved.emit();
      },
      error: () => {
        this.rowSaving.update((s) => {
          const next = new Set(s);
          next.delete(id);
          return next;
        });
      },
    });
  }

  // --- score state (ex-sheet) ---
  private readonly edits = signal<ReadonlyMap<string, number | null>>(new Map());
  private readonly memEdits = signal<ReadonlyMap<number, number | null>>(new Map());
  /** Refused score cells per pupil (`studentId:moduleCode`). */
  readonly badCells = signal<ReadonlyMap<number, ReadonlySet<string>>>(new Map());

  /** Weekly-scope modules only; murajaa module lives in review cycles. Inactive = grayed. */
  readonly sheetModules = computed(() => this.modules().filter((m) => m.scope === 'weekly'));

  private readonly existingMap = computed(() => {
    const m = new Map<string, number>();
    for (const row of this.scoreRows()) {
      for (const s of row.scores as SessionScore[])
        m.set(`${row.student_id}:${s.module.code}`, s.score);
    }
    return m;
  });

  /** Effective memorized amount for a pupil: an explicit edit wins, else the level default. */
  memorizedFor(studentId: number): number | null {
    const edited = this.memEdits().get(studentId);
    return edited !== undefined ? edited : this.defaultMemorization()(studentId);
  }

  cellsFor(student: Student): ScoreCell[] {
    return this.sheetModules().map((mod) => {
      const key = `${student.id}:${mod.code}`;
      const edited = this.edits().get(key);
      return {
        module: mod,
        current: edited !== undefined ? edited : (this.existingMap().get(key) ?? null),
      };
    });
  }

  totalFor(student: Student): number | null {
    const counted = this.cellsFor(student).filter(
      (c) => c.module.is_active && c.module.is_in_weekly_total && c.current !== null,
    );
    return counted.length > 0
      ? Math.round(counted.reduce((a, c) => a + (c.current ?? 0), 0) * 10) / 10
      : null;
  }

  /** Parse a memorized-amount input (blank → null → remove the log). */
  parseAmount(raw: string): number | null {
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    return Number.isNaN(n) || n <= 0 ? null : n;
  }

  onMemorizeChange(studentId: number, event: Event): void {
    this.setMemorized(studentId, this.parseAmount((event.target as HTMLInputElement).value));
  }

  setScore(studentId: number, code: string, value: number | null): void {
    const key = `${studentId}:${code}`;
    this.edits.update((m) => {
      const next = new Map(m);
      if (value === null) next.delete(key);
      else next.set(key, value);
      return next;
    });
    // A fresh edit supersedes the last refusal for that cell.
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
    this.memEdits.update((m) => {
      const next = new Map(m);
      next.set(studentId, value);
      return next;
    });
    this.clearRowErrorIfClean(studentId);
  }

  // --- goal state (ex-goal-list, §2.20: selected week only) ---
  private readonly tick = signal(0);
  private readonly goals = resource({
    params: () => ({ w: this.weekId(), t: this.tick() }),
    loader: ({ params }) =>
      params.w === null
        ? Promise.resolve([] as WeeklyGoal[])
        : firstValueFrom(this.entry.goals({ week_id: params.w }).pipe(map((p) => p.data))),
  });

  private readonly drafts = signal<
    ReadonlyMap<number, { target: string; done: boolean; saving: boolean }>
  >(new Map());
  private readonly goalBad = signal<ReadonlySet<number>>(new Set());

  private readonly goalMap = computed(() => {
    const m = new Map<number, WeeklyGoal>();
    for (const g of this.goals.value() ?? []) m.set(g.student_id, g);
    return m;
  });

  goalTarget(id: number): string {
    return this.drafts().get(id)?.target ?? this.goalMap().get(id)?.target_text ?? '';
  }

  goalDone(id: number): boolean {
    return this.drafts().get(id)?.done ?? this.goalMap().get(id)?.is_completed ?? false;
  }

  editGoal(id: number, patch: Partial<{ target: string; done: boolean }>): void {
    const cur = this.drafts().get(id) ?? { target: this.goalTarget(id), done: this.goalDone(id) };
    this.drafts.update((m) => new Map(m).set(id, { ...cur, ...patch, saving: false }));
    if (this.goalBad().has(id)) {
      this.goalBad.update((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      this.clearRowErrorIfClean(id);
    }
  }

  trackInput(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  trackCheck(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  constructor() {
    // Unsaved goal text must not travel between weeks.
    effect(() => {
      this.weekId();
      this.drafts.set(new Map());
    });
  }

  // --- per-row save ---
  private readonly rowSaving = signal<ReadonlySet<number>>(new Set());
  /** Static banner key per failed pupil (cell details ride the cells). */
  readonly rowError = signal<ReadonlyMap<number, string>>(new Map());

  readonly attOptions: DropdownOption[] = ATT_STATES.map((s) => ({
    value: s,
    labelKey: `attendance.${s}`,
  }));

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

  private pupilScoreEdits(
    id: number,
  ): { student_id: number; module_code: string; score: number }[] {
    const out: { student_id: number; module_code: string; score: number }[] = [];
    for (const [key, v] of this.edits()) {
      if (v === null || !key.startsWith(`${id}:`)) continue;
      out.push({ student_id: id, module_code: key.slice(`${id}:`.length), score: v });
    }
    return out;
  }

  rowDirty(id: number): boolean {
    if (this.attEdits().has(id) || this.drafts().has(id)) return true;
    if (this.disabledAll()) return false;
    if (this.memEdits().has(id)) return true;
    for (const key of this.edits().keys()) if (key.startsWith(`${id}:`)) return true;
    // Memorization sessions always send the (pre-filled) amount, like before.
    return this.showMemorization() && this.students().some((s) => s.id === id);
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

  saveRow(id: number): void {
    const sid = this.sessionId();
    if (sid === null || this.rowSaving().has(id)) return;
    const jobs: Record<string, Observable<PartResult>> = {};

    if (this.attEdits().has(id)) {
      const rec = { student_id: id, status: this.attStatus(id) };
      jobs['att'] = this.entry.attendanceBulk(sid, [rec]).pipe(
        map((): PartResult => ({ ok: true })),
        catchError((err: unknown) => of({ ok: false, err })),
      );
    }

    let sentScores: { student_id: number; module_code: string }[] = [];
    if (!this.disabledAll()) {
      const records = this.pupilScoreEdits(id);
      const mem =
        this.showMemorization() && this.students().some((s) => s.id === id)
          ? [{ student_id: id, thumn_amount: this.memorizedFor(id) }]
          : [];
      if (records.length > 0 || mem.length > 0) {
        sentScores = records;
        jobs['scores'] = this.entry.scoresBulk(sid, records, mem).pipe(
          map((): PartResult => ({ ok: true })),
          catchError((err: unknown) => of({ ok: false, err })),
        );
      }
    }

    const draft = this.drafts().get(id);
    const wid = this.weekId();
    if (draft && wid !== null) {
      const target = draft.target;
      const done = draft.done;
      jobs['goal'] = this.entry.upsertGoal(id, wid, target || null, done).pipe(
        map((): PartResult => ({ ok: true })),
        catchError((err: unknown) => of({ ok: false, err })),
      );
    }

    if (Object.keys(jobs).length === 0) return;
    this.rowError.update((m) => {
      const next = new Map(m);
      next.delete(id);
      return next;
    });
    this.rowSaving.update((s) => new Set(s).add(id));
    forkJoin(jobs).subscribe((res) => {
      let anyOk = false;
      const att = res['att'];
      if (att) {
        if (att.ok) {
          this.attEdits.update((m) => {
            const next = new Map(m);
            next.delete(id);
            return next;
          });
          this.attBad.update((s) => {
            const next = new Set(s);
            next.delete(id);
            return next;
          });
          anyOk = true;
        } else {
          this.attBad.update((s) => new Set(s).add(id));
        }
      }
      const sco = res['scores'];
      if (sco) {
        if (sco.ok) {
          const prefix = `${id}:`;
          this.edits.update((m) => {
            const next = new Map(m);
            for (const key of next.keys()) if (key.startsWith(prefix)) next.delete(key);
            return next;
          });
          this.memEdits.update((m) => {
            const next = new Map(m);
            next.delete(id);
            return next;
          });
          this.badCells.update((m) => {
            if (!m.has(id)) return m;
            const next = new Map(m);
            next.delete(id);
            return next;
          });
          anyOk = true;
        } else {
          const cells = this.badCellsFrom(sco.err, sentScores);
          this.badCells.update((m) => {
            const next = new Map(m);
            if (cells.size === 0) next.delete(id);
            else next.set(id, cells);
            return next;
          });
        }
      }
      const gol = res['goal'];
      if (gol) {
        if (gol.ok) {
          this.drafts.update((m) => {
            const next = new Map(m);
            next.delete(id);
            return next;
          });
          this.goalBad.update((s) => {
            const next = new Set(s);
            next.delete(id);
            return next;
          });
          this.tick.update((n) => n + 1);
          anyOk = true;
        } else {
          this.goalBad.update((s) => new Set(s).add(id));
        }
      }
      if (
        !anyOk ||
        this.attBad().has(id) ||
        this.goalBad().has(id) ||
        (this.badCells().get(id)?.size ?? 0) > 0
      ) {
        this.rowError.update((m) => new Map(m).set(id, 'entry.save_failed'));
      }
      this.rowSaving.update((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
      // Refresh server truth; refused edits stay on top of it.
      if (anyOk) this.saved.emit();
    });
  }
}
