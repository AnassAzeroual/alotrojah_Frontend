import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { GroupsService } from '../../core/api/groups.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-groups-list-page',
  standalone: true,
  imports: [TranslatePipe, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="page-head anim-rise">
        <h1>{{ 'nav.groups' | translate }}</h1>
      </div>
      @if (groups.isLoading()) {
        <div class="stack" aria-hidden="true">
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
        </div>
      } @else if ((groups.value() ?? []).length === 0) {
        <app-empty-state />
      } @else {
        <div class="grid-auto">
          @for (g of groups.value() ?? []; track g.id) {
            <div class="card anim-rise" [style.--i]="$index">
              <span class="row-top">
                <span class="avatar-sm" aria-hidden="true">{{ g.name.slice(0, 1) }}</span>
                <strong>{{ g.name }}</strong>
              </span>
              <small class="muted"
                >{{ g.teacher?.full_name ?? '—' }} · {{ g.students_count ?? 0 }}</small
              >
              <small class="muted ltr-num">{{ g.schedule_days }}</small>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class GroupsListPage {
  private readonly groupsSvc = inject(GroupsService);

  protected readonly groups = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.groupsSvc.list().pipe(map((p) => p.data))),
  });
}
