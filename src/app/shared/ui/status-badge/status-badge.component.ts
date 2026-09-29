import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type BadgeKind = 'attendance' | 'honor' | 'generic';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="badgeClass()">{{ labelKey() | translate }}</span>`,
  styles: [
    `
      .badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 13px;
        background: #eef1ef;
      }
      .badge.ok {
        background: #dff0e7;
        color: var(--color-primary-dark);
      }
      .badge.warn {
        background: #fdf0d5;
        color: var(--color-warn);
      }
      .badge.bad {
        background: #fbe3e0;
        color: var(--color-danger);
      }
    `,
  ],
})
export class StatusBadgeComponent {
  readonly kind = input<BadgeKind>('generic');
  readonly value = input.required<string>();

  readonly labelKey = computed(() => `${this.kind() === 'generic' ? 'common' : this.kind()}.${this.value()}`);
  readonly badgeClass = computed(() => {
    const v = this.value();
    if (['present', 'tashji3'].includes(v)) return 'badge ok';
    if (['late', 'excused', 'intibah'].includes(v)) return 'badge warn';
    if (['absent'].includes(v)) return 'badge bad';
    return 'badge';
  });
}
