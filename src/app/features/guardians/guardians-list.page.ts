import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { GuardiansService } from './guardians.service';

@Component({
  selector: 'app-guardians-list-page',
  standalone: true,
  imports: [TranslatePipe, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="page-head anim-rise">
        <h1>{{ 'nav.guardians' | translate }}</h1>
      </div>
      @if (guardians.isLoading()) {
        <div class="stack" aria-hidden="true">
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
        </div>
      } @else if ((guardians.value() ?? []).length === 0) {
        <app-empty-state />
      } @else {
        <div class="grid-auto">
          @for (g of guardians.value() ?? []; track g.id) {
            <div class="card anim-rise" [style.--i]="$index">
              <span class="row-top">
                <span class="avatar-sm" aria-hidden="true">{{ g.full_name.slice(0, 1) }}</span>
                <strong>{{ g.full_name }}</strong>
              </span>
              <small class="muted ltr-num">{{ g.phone ?? '—' }}</small>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class GuardiansListPage {
  private readonly guardiansSvc = inject(GuardiansService);

  protected readonly guardians = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.guardiansSvc.list().pipe(map((p) => p.data))),
  });
}
