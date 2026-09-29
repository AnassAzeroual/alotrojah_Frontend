import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { GuardiansService } from './guardians.service';

@Component({
  selector: 'app-guardians-list-page',
  standalone: true,
  imports: [TranslatePipe, SpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="list">
      <h1>{{ 'nav.guardians' | translate }}</h1>
      @if (guardians.isLoading()) {
        <app-spinner />
      } @else if ((guardians.value() ?? []).length === 0) {
        <app-empty-state />
      } @else {
        <div class="rows">
          @for (g of guardians.value() ?? []; track g.id) {
            <div class="card row">
              <strong>{{ g.full_name }}</strong>
              <small class="muted ltr-num">{{ g.phone ?? '—' }}</small>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class GuardiansListPage {
  protected readonly guardians = resource({
    params: () => ({}),
    loader: () =>
      firstValueFrom(
        inject(GuardiansService)
          .list()
          .pipe(map((p) => p.data)),
      ),
  });
}
