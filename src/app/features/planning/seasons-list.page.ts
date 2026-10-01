import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { SeasonsService } from '../../core/api/seasons.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-seasons-list-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="page-head anim-rise">
        <h1>{{ 'planning.title' | translate }}</h1>
        <div class="actions">
          <a class="btn btn-primary" routerLink="/planning/new">{{
            'planning.new_season' | translate
          }}</a>
        </div>
      </div>
      @if (seasons.isLoading()) {
        <div class="stack" aria-hidden="true">
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
        </div>
      } @else if ((seasons.value() ?? []).length === 0) {
        <app-empty-state />
      } @else {
        <div class="grid-auto">
          @for (s of seasons.value() ?? []; track s.id) {
            <div class="card anim-rise" [style.--i]="$index">
              <span class="row-top">
                <strong>{{ s.name }}</strong>
                @if (s.is_current) {
                  <small class="cur">{{ 'planning.current' | translate }}</small>
                }
              </span>
              <small class="muted ltr-num">{{ s.total_weeks }} / {{ s.total_sessions }}</small>
              <div class="cluster">
                @if (!s.is_current) {
                  <button type="button" class="btn btn-ghost" (click)="activate(s.id)">
                    {{ 'planning.activate' | translate }}
                  </button>
                }
                <a class="btn btn-ghost" [routerLink]="['/planning/terms', s.id]">{{
                  'planning.terms' | translate
                }}</a>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class SeasonsListPage {
  private readonly seasonsSvc = inject(SeasonsService);

  protected readonly seasons = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.seasonsSvc.list().pipe(map((p) => p.data))),
  });

  protected activate(id: number): void {
    this.seasonsSvc.activate(id).subscribe(() => this.seasons.reload());
  }
}
