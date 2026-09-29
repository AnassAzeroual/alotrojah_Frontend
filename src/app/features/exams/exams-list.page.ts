import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { ExamsService } from '../../core/api/exams.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-exams-list-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, SpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="list">
      <h1>{{ 'exam.title' | translate }}</h1>
      <a class="card row" routerLink="/exams/new">{{ 'exam.new' | translate }}</a>
      <label>{{ 'exam.filter_type' | translate }}
        <select [value]="type() ?? ''" (change)="type.set($any($event.target).value || null)">
          <option value="">{{ 'list.all' | translate }}</option>
          <option value="hizb_completion">hizb_completion</option>
          <option value="term_batch">term_batch</option>
          <option value="final_season">final_season</option>
        </select>
      </label>
      @if (exams.isLoading()) {
        <app-spinner />
      } @else if ((exams.value() ?? []).length === 0) {
        <app-empty-state />
      } @else {
        <div class="rows">
          @for (e of exams.value() ?? []; track e.id) {
            <a class="card row" [routerLink]="['/exams', e.id]">
              <strong>#{{ e.id }} Â· {{ e.exam_type }}</strong>
              <small class="muted ltr-num">{{ e.exam_date ?? 'â€”' }} Â· {{ e.overall_avg ?? 'â€”' }}{{ 'common.of20' | translate }}</small>
            </a>
          }
        </div>
      }
    </section>
  `,
})
export class ExamsListPage {
  private readonly examsSvc = inject(ExamsService);

  readonly type = signal<string | null>(null);

  protected readonly exams = resource({
    params: () => ({ t: this.type() }),
    loader: ({ params }) =>
      firstValueFrom(
        this.examsSvc.list(params.t ? { exam_type: params.t } : undefined).pipe(map((p) => p.data)),
      ),
  });
}
