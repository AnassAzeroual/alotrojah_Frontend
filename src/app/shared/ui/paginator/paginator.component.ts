import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pager">
      <button
        type="button"
        [disabled]="page() <= 1"
        [attr.aria-label]="'list.pager_prev' | translate"
        (click)="go(page() - 1)"
      >
        ‹
      </button>
      <span class="ltr-num">{{ page() }} / {{ pages() }}</span>
      <button
        type="button"
        [disabled]="page() >= pages()"
        [attr.aria-label]="'list.pager_next' | translate"
        (click)="go(page() + 1)"
      >
        ›
      </button>
      <small class="muted">{{ 'list.total' | translate: { count: total() } }}</small>
    </div>
  `,
  styles: [
    `
      .pager {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        justify-content: center;
        padding-block: var(--space-3);
      }
      button {
        min-width: 44px;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        border-radius: var(--radius-sm);
      }
      button:disabled {
        opacity: 0.4;
      }
    `,
  ],
})
export class PaginatorComponent {
  readonly page = input.required<number>();
  readonly perPage = input(20);
  readonly total = input.required<number>();
  readonly pageChange = output<number>();

  readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / this.perPage())));

  protected go(p: number): void {
    this.pageChange.emit(p);
  }
}
