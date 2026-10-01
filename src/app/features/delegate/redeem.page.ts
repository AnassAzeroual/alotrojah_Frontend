import { ChangeDetectionStrategy, Component, inject, input, resource } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { DelegationsService } from '../../core/api/delegations.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

/** Opened from the WhatsApp link: /delegate/redeem?token=… (public route, token IS the credential). */
@Component({
  selector: 'app-redeem-page',
  standalone: true,
  imports: [TranslatePipe, SpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="card hero anim-pop">
        <h1>{{ 'delegation.title' | translate }}</h1>
        @if (result.isLoading()) {
          <app-spinner />
        } @else if (result.value(); as r) {
          <p>{{ 'delegation.granted' | translate }} ({{ r.group_id }})</p>
          <p class="muted ltr-num">{{ r.expires_at }}</p>
        } @else {
          <app-empty-state messageKey="delegation.invalid" />
        }
      </div>
    </section>
  `,
})
export class RedeemPage {
  readonly token = input<string | null>(null);

  private readonly delegations = inject(DelegationsService);

  protected readonly result = resource({
    params: () => ({ t: this.token() }),
    loader: ({ params }) => {
      if (!params.t) return Promise.resolve(null);
      return firstValueFrom(this.delegations.redeem(params.t));
    },
  });
}
