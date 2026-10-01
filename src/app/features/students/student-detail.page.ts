import { ChangeDetectionStrategy, Component, inject, input, resource } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from '../../core/api/dashboard.service';
import { StudentsService } from '../../core/api/students.service';
import { ReferenceService } from '../../core/api/reference.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-student-detail-page',
  standalone: true,
  imports: [TranslatePipe, EmptyStateComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-detail.page.html',
})
export class StudentDetailPage {
  readonly id = input.required<number, string>({ transform: (v: string) => Number(v) });

  private readonly studentsSvc = inject(StudentsService);
  private readonly dash = inject(DashboardService);
  private readonly ref = inject(ReferenceService);

  private readonly student = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => firstValueFrom(this.studentsSvc.get(params.id)),
  });

  private readonly season = resource({
    params: () => ({}),
    loader: () =>
      firstValueFrom(this.ref.seasons()).then(
        (r) => r.data.find((s) => s.is_current) ?? r.data[0] ?? null,
      ),
  });

  private readonly summary = resource({
    params: () => ({ id: this.id(), season: this.season.value()?.id ?? null }),
    loader: ({ params }) =>
      params.season === null
        ? Promise.resolve(null)
        : firstValueFrom(this.dash.season(params.id, params.season)),
  });

  private readonly final = resource({
    params: () => ({ id: this.id(), season: this.season.value()?.id ?? null }),
    loader: ({ params }) =>
      params.season === null
        ? Promise.resolve(null)
        : firstValueFrom(this.dash.final(params.id, params.season)),
  });

  protected readonly studentVal = () => this.student.value() ?? null;
  protected readonly summaryVal = () => this.summary.value() ?? null;
  protected readonly finalVal = () => this.final.value() ?? null;
  protected readonly loading = () => this.student.isLoading() || this.summary.isLoading();
}
