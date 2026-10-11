import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ScoringModule, SessionScore, Student } from '../../../core/api/api-models';
import { EntryService, SessionStudentScores } from '../../../core/api/entry.service';
import { ScoreInputComponent } from '../../../shared/ui/score-input/score-input.component';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

interface Cell {
  module: ScoringModule;
  current: number | null;
}

interface Row {
  student: Student;
  cells: Cell[];
  total: number | null;
}

@Component({
  selector: 'app-score-sheet',
  standalone: true,
  imports: [FormsModule, TranslatePipe, SpinnerComponent, ScoreInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './score-sheet.component.html',
  styleUrl: './score-sheet.component.scss',
})
export class ScoreSheetComponent {
  private readonly entry = inject(EntryService);

  readonly students = input.required<Student[]>();
  readonly modules = input.required<ScoringModule[]>();
  readonly scoreRows = input.required<SessionStudentScores[]>();
  readonly sessionId = input.required<number | null>();
  /** Murajaa teachers see the sheet disabled (same page, inputs by type). */
  readonly disabledAll = input(false);
  /** §B: show the per-pupil memorized-amount field (memorization sessions only). */
  readonly showMemorization = input(false);
  /** §B: level-expected thumn/session default per pupil, when one exists. */
  readonly defaultMemorization = input<(studentId: number) => number | null>(() => null);
  readonly saved = output<void>();

  readonly saving = signal(false);
  private readonly edits = signal<ReadonlyMap<string, number | null>>(new Map());
  private readonly memEdits = signal<ReadonlyMap<number, number | null>>(new Map());

  /** Weekly-scope modules only; murajaa module lives in review cycles. Inactive = grayed. */
  readonly sheetModules = computed(() => this.modules().filter((m) => m.scope === 'weekly'));
  readonly inTotalModules = computed(() =>
    this.sheetModules().filter((m) => m.is_active && m.is_in_weekly_total),
  );

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

  readonly rows = computed((): Row[] =>
    this.students().map((st) => {
      const cells = this.sheetModules().map((mod) => {
        const key = `${st.id}:${mod.code}`;
        const edited = this.edits().get(key);
        return {
          module: mod,
          current: edited !== undefined ? edited : (this.existingMap().get(key) ?? null),
        };
      });
      const counted = cells.filter(
        (c) => c.module.is_active && c.module.is_in_weekly_total && c.current !== null,
      );
      return {
        student: st,
        cells,
        total:
          counted.length > 0
            ? Math.round(counted.reduce((a, c) => a + (c.current ?? 0), 0) * 10) / 10
            : null,
      };
    }),
  );

  readonly dirty = computed(
    () =>
      this.edits().size > 0 ||
      // §B: on memorization sessions the sheet also persists the (pre-filled) amounts.
      (this.showMemorization() && this.students().length > 0),
  );

  /** §B: parse a memorized-amount input (blank → null → remove the log). */
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
  }

  /** §B: explicit memorized amount (null = blank → remove the session log). */
  setMemorized(studentId: number, value: number | null): void {
    this.memEdits.update((m) => {
      const next = new Map(m);
      next.set(studentId, value);
      return next;
    });
  }

  save(): void {
    const sid = this.sessionId();
    if (sid === null || this.saving() || this.disabledAll()) return;
    const records = [...this.edits().entries()]
      .filter(([, v]) => v !== null)
      .map(([key, v]) => {
        const [studentId, code] = key.split(':');
        return { student_id: Number(studentId), module_code: code, score: v as number };
      });
    const memorize = this.showMemorization()
      ? this.students().map((st) => ({
          student_id: st.id,
          thumn_amount: this.memorizedFor(st.id),
        }))
      : [];
    if (records.length === 0 && memorize.length === 0) return;
    this.saving.set(true);
    this.entry.scoresBulk(sid, records, memorize).subscribe({
      next: () => {
        this.edits.set(new Map());
        this.memEdits.set(new Map());
        this.saving.set(false);
        this.saved.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
