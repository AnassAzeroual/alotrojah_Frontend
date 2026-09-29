import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card">
      <h1>{{ 'app.title' | translate }}</h1>
      <p class="muted">{{ 'app.subtitle' | translate }}</p>
      <p>{{ user()?.full_name }} — {{ user() ? ('role.' + user()?.role | translate) : '' }}</p>
    </section>
  `,
})
export class HomePage {
  protected readonly user = inject(AuthService).currentUser;
}
