import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { EntryService, WeeklyGoal } from '../../../core/api/entry.service';
import { Student } from '../../../core/api/api-models';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

interface GoalRow {
  student: Student;
  goal: WeeklyGoal | null;
  target: string;
  done: boolean;
  saving: boolean;
}

@Component({
  selector: 'app-goal-list',
  standalone: true,
  imports: [TranslatePipe, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './goal-list.component.html',
})
export class GoalListComponent {
  private readonly entry = inject(EntryService);

  readonly students = input.required<Student[]>();
  readonly weekId = input.required<number | null>();

  private readonly tick = signal(0);

  // §2.20: load only the selected week's goals — the unfiltered list let the
  // newest goal per pupil shadow every older week (blank boxes).
  private readonly goals = resource({
    params: () => ({ weekId: this.weekId(), t: this.tick() }),
    loader: ({ params }) =>
      params.weekId === null
        ? Promise.resolve([] as WeeklyGoal[])
        : firstValueFrom(this.entry.goals({ week_id: params.weekId }).pipe(map((p) => p.data))),
  });

  private readonly drafts = signal<
    ReadonlyMap<number, { target: string; done: boolean; saving: boolean }>
  >(new Map());

  readonly rows = computed((): GoalRow[] => {
    const byStudent = new Map((this.goals.value() ?? []).map((g) => [g.student_id, g]));
    return this.students().map((st) => {
      const existing = byStudent.get(st.id) ?? null;
      const d = this.drafts().get(st.id);
      return {
        student: st,
        goal: existing,
        target: d?.target ?? (existing?.target_text ?? ''),
        done: d?.done ?? (existing?.is_completed ?? false),
        saving: d?.saving ?? false,
      };
    });
  });

  constructor() {
    // §2.20: unsaved text must not travel between weeks.
    effect(() => {
      this.weekId();
      this.drafts.set(new Map());
    });
  }

  edit(id: number, patch: Partial<{ target: string; done: boolean }>): void {
    const cur = this.drafts().get(id) ?? {
      target: this.rows().find((r) => r.student.id === id)?.target ?? '',
      done: this.rows().find((r) => r.student.id === id)?.done ?? false,
      saving: false,
    };
    this.drafts.update((m) => new Map(m).set(id, { ...cur, ...patch, saving: cur.saving }));
  }

  save(row: GoalRow): void {
    const wid = this.weekId();
    if (wid === null) return;
    this.edit(row.student.id, {});
    this.drafts.update((m) => {
      const cur = m.get(row.student.id) ?? { target: row.target, done: row.done, saving: false };
      return new Map(m).set(row.student.id, { ...cur, saving: true });
    });
    const d = this.drafts().get(row.student.id) ?? { target: row.target, done: row.done };
    this.entry.upsertGoal(row.student.id, wid, d.target || null, d.done).subscribe({
      next: () => {
        this.drafts.update((m) => {
          const next = new Map(m);
          next.delete(row.student.id);
          return next;
        });
        this.tick.update((n) => n + 1);
      },
      error: () => {
        const cur = this.drafts().get(row.student.id);
        if (cur)
          this.drafts.update((m) => new Map(m).set(row.student.id, { ...cur, saving: false }));
      },
    });
  }

  protected trackInput(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected trackCheck(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }
}
