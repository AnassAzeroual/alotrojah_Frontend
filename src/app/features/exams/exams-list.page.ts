import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { ExamsService } from '../../core/api/exams.service';
import { LanguageService } from '../../core/i18n/language.service';
import { DropdownComponent, dropdownText } from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-exams-list-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, DropdownComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="page-head anim-rise">
        <h1 class="with-add">
          {{ 'exam.title' | translate }}
          <a
            class="btn btn-primary btn-icon"
            routerLink="/exams/new"
            data-testid="exams-new"
            [attr.aria-label]="'exam.new' | translate"
            [attr.title]="'exam.new' | translate"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </a>
        </h1>
      </div>
      <div class="card anim-rise" style="--i: 1">
        <label class="field"
          ><span>{{ 'exam.filter_type' | translate }}</span>
          <app-dropdown
            [options]="typeOptions()"
            [value]="type() ?? ''"
            (valueChange)="type.set(txt($event) || null)"
            ariaLabelKey="exam.filter_type"
          />
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
              <strong
                >{{ e.student_name ?? '—' }} · {{ 'examType.' + e.exam_type | translate }}</strong
              >
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
  protected readonly txt = dropdownText;

  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);

  readonly typeOptions = computed(() => {
    this.language.current();
    const t = (k: string): string => this.i18n.instant(k);
    return [
      { value: '', label: t('list.all') },
      { value: 'hizb_completion', labelKey: 'examType.hizb_completion' },
      { value: 'term_batch', labelKey: 'examType.term_batch' },
      { value: 'final_season', labelKey: 'examType.final_season' },
    ];
  });

  protected readonly exams = resource({
    params: () => ({ t: this.type() }),
    loader: ({ params }) =>
      firstValueFrom(
        this.examsSvc.list(params.t ? { exam_type: params.t } : undefined).pipe(map((p) => p.data)),
      ),
  });
}
