import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
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
  imports: [TranslatePipe, SpinnerComponent, ScoreInputComponent],
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
  readonly saved = output<void>();

  readonly saving = signal(false);
  private readonly edits = signal<ReadonlyMap<string, number | null>>(new Map());

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

  readonly dirty = computed(() => this.edits().size > 0);

  setScore(studentId: number, code: string, value: number | null): void {
    const key = `${studentId}:${code}`;
    this.edits.update((m) => {
      const next = new Map(m);
      if (value === null) next.delete(key);
      else next.set(key, value);
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
    if (records.length === 0) return;
    this.saving.set(true);
    this.entry.scoresBulk(sid, records).subscribe({
      next: () => {
        this.edits.set(new Map());
        this.saving.set(false);
        this.saved.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
