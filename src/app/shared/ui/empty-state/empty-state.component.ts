import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="muted empty">{{ messageKey() | translate: messageParams() }}</p>`,
  styles: [
    `
      .empty {
        text-align: center;
        padding: var(--space-5);
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly messageKey = input('common.empty');
  /** Interpolation params (e.g. `{ q }` for a "no results" echo). */
  readonly messageParams = input<Record<string, unknown>>({});
}
