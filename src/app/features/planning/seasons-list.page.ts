import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { SeasonsService } from '../../core/api/seasons.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-seasons-list-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, SpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="list">
      <h1>{{ 'planning.title' | translate }}</h1>
      <a class="card row" routerLink="/planning/new">{{ 'planning.new_season' | translate }}</a>
      @if (seasons.isLoading()) {
        <app-spinner />
      } @else if ((seasons.value() ?? []).length === 0) {
        <app-empty-state />
      } @else {
        <div class="rows">
          @for (s of seasons.value() ?? []; track s.id) {
            <div class="card row">
              <strong>{{ s.name }}</strong>
              <small class="muted ltr-num">{{ s.total_weeks }} / {{ s.total_sessions }}</small>
              @if (s.is_current) {
                <small class="cur">{{ 'planning.current' | translate }}</small>
              } @else {
                <button type="button" (click)="activate(s.id)">{{ 'planning.activate' | translate }}</button>
              }
              <a [routerLink]="['/planning/terms', s.id]">{{ 'planning.terms' | translate }}</a>
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
