import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { EntryService, AttendanceRow } from '../../../core/api/entry.service';
import { Student } from '../../../core/api/api-models';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

const STATES = ['present', 'late', 'absent', 'excused'] as const;
type Status = (typeof STATES)[number];

interface Row {
  student: Student;
  status: Status;
}

@Component({
  selector: 'app-attendance-grid',
  standalone: true,
  imports: [TranslatePipe, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attendance-grid.component.html',
  styleUrl: './attendance-grid.component.scss',
})
export class AttendanceGridComponent {
  private readonly entry = inject(EntryService);

  readonly students = input.required<Student[]>();
  readonly existing = input.required<AttendanceRow[]>();
  readonly sessionId = input.required<number | null>();
  readonly saved = output<void>();

  readonly saving = signal(false);
  private readonly edits = signal<ReadonlyMap<number, Status>>(new Map());

  private readonly existingMap = computed(() => {
    const m = new Map<number, Status>();
    for (const r of this.existing()) m.set(r.student_id, r.status);
    return m;
  });

  readonly rows = computed((): Row[] =>
    this.students().map((s) => ({
      student: s,
      status: this.edits().get(s.id) ?? this.existingMap().get(s.id) ?? 'present',
    })),
  );

  readonly dirty = computed(() => this.edits().size > 0);

  setStatus(id: number, status: Status): void {
    this.edits.update((m) => new Map(m).set(id, status));
  }

  save(): void {
    const sid = this.sessionId();
    if (sid === null || this.saving()) return;
    this.saving.set(true);
    this.entry
      .attendanceBulk(
        sid,
        this.rows().map((r) => ({ student_id: r.student.id, status: r.status })),
      )
      .subscribe({
        next: () => {
          this.edits.set(new Map());
          this.saving.set(false);
          this.saved.emit();
        },
        error: () => this.saving.set(false),
      });
  }
}
