import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { ExamsService } from '../../core/api/exams.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-exams-list-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="page-head anim-rise">
        <h1>{{ 'exam.title' | translate }}</h1>
        <div class="actions">
          <a class="btn btn-primary" routerLink="/exams/new">{{ 'exam.new' | translate }}</a>
        </div>
      </div>
      <div class="card anim-rise" style="--i: 1">
        <label class="field"
          ><span>{{ 'exam.filter_type' | translate }}</span>
          <select [value]="type() ?? ''" (change)="type.set($any($event.target).value || null)">
            <option value="">{{ 'list.all' | translate }}</option>
            <option value="hizb_completion">{{ 'examType.hizb_completion' | translate }}</option>
            <option value="term_batch">{{ 'examType.term_batch' | translate }}</option>
            <option value="final_season">{{ 'examType.final_season' | translate }}</option>
          </select>
        </label>
      </div>
      @if (exams.isLoading()) {
        <div class="stack" aria-hidden="true">
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
        </div>
      } @else if ((exams.value() ?? []).length === 0) {
        <app-empty-state />
      } @else {
        <div class="grid-auto">
          @for (e of exams.value() ?? []; track e.id) {
            <a class="card anim-rise" [style.--i]="$index + 2" [routerLink]="['/exams', e.id]">
              <strong>#{{ e.id }} · {{ 'examType.' + e.exam_type | translate }}</strong>
              <small class="muted ltr-num"
                >{{ e.exam_date ?? '—' }} · {{ e.overall_avg ?? '—'
                }}{{ 'common.of20' | translate }}</small
              >
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
