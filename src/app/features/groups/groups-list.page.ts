import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { GroupsService } from '../../core/api/groups.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-groups-list-page',
  standalone: true,
  imports: [TranslatePipe, SpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="list">
      <h1>{{ 'nav.groups' | translate }}</h1>
      @if (groups.isLoading()) {
        <app-spinner />
      } @else if ((groups.value() ?? []).length === 0) {
        <app-empty-state />
      } @else {
        <div class="rows">
          @for (g of groups.value() ?? []; track g.id) {
            <div class="card row">
              <strong>{{ g.name }}</strong>
              <small class="muted">{{ g.teacher?.full_name ?? 'â€”' }} Â· {{ g.students_count ?? 0 }}</small>
              <small class="muted ltr-num">{{ g.schedule_days }}</small>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class GroupsListPage {
  protected readonly groups = resource({
    params: () => ({}),
    loader: () => firstValueFrom(inject(GroupsService).list().pipe(map((p) => p.data))),
  });
}
