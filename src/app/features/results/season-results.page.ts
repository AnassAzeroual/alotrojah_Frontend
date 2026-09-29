import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { ReferenceService } from '../../core/api/reference.service';
import { ResultsService } from '../../core/api/results.service';
import { StudentsService } from '../../core/api/students.service';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-season-results-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, SpinnerComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './season-results.page.html',
})
export class SeasonResultsPage {
  private readonly results = inject(ResultsService);
  private readonly studentsSvc = inject(StudentsService);
  private readonly ref = inject(ReferenceService);

  readonly search = signal('');
  readonly pickedStudent = signal<number | null>(null);
  readonly saving = signal(false);
  private readonly tick = signal(0);

  readonly found = resource({
    params: () => ({ q: this.search() }),
    loader: ({ params }) =>
      params.q.trim() === ''
        ? Promise.resolve([])
        : firstValueFrom(this.studentsSvc.list({ q: params.q }).pipe(map((p) => p.data))),
  });

  readonly seasons = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.ref.seasons()),
  });

  private currentSeasonId(): number | null {
    const list = this.seasons.value()?.data ?? [];
    return list.find((s) => s.is_current)?.id ?? list[0]?.id ?? null;
  }

  readonly existing = resource({
    params: () => ({ st: this.pickedStudent(), tick: this.tick() }),
    loader: ({ params }) => {
      const season = this.currentSeasonId();
      if (params.st === null || season === null) return Promise.resolve(null);
      return firstValueFrom(
        this.results.seasonResults({ student_id: params.st, season_id: season }).pipe(map((p) => p.data[0] ?? null)),
      );
    },
  });

  readonly form = new FormGroup({
    total_memorized_label: new FormControl('', { nonNullable: true }),
    overall_avg: new FormControl<number | null>(null),
    board_report: new FormControl('', { nonNullable: true }),
    honor_flag: new FormControl('none', { nonNullable: true }),
  });

  fill(): void {
    const e = this.existing.value();
    if (!e) return;
    this.form.patchValue({
      total_memorized_label: e.total_memorized_label ?? '',
      overall_avg: e.overall_avg,
      board_report: e.board_report ?? '',
      honor_flag: e.honor_flag,
    });
  }

  submit(): void {
    const st = this.pickedStudent();
    const season = this.currentSeasonId();
    if (st === null || season === null || this.saving()) return;
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.results
      .upsertSeason({
        student_id: st,
        season_id: season,
        total_memorized_label: v.total_memorized_label || null,
        overall_avg: v.overall_avg,
        board_report: v.board_report || null,
        honor_flag: v.honor_flag,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.tick.update((n) => n + 1);
        },
        error: () => this.saving.set(false),
      });
  }
}
