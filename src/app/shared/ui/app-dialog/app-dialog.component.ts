import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TranslatePipe } from '@ngx-translate/core';

/** Data-driven confirm/alert body. All labels are i18n keys. */
export interface AppDialogData {
  titleKey: string;
  messageKey: string;
  /** Omit for an alert (single OK action). */
  confirmKey?: string;
  cancelKey?: string;
  /** Confirm button renders in the danger style (leaving without saving, …). */
  danger?: boolean;
}

/**
 * Shared CDK-dialog surface for app-wide confirmations and server-error
 * alerts. Rendered in the CDK overlay (outside the page), so it replaces the
 * old per-page inline `.banner danger` unsaved-changes blocks — one themed,
 * translated, RTL-safe dialog instead of 18 copies.
 */
@Component({
  selector: 'app-app-dialog',
  imports: [TranslatePipe],
  template: `
    <div
      class="dlg"
      role="alertdialog"
      aria-modal="true"
      [attr.aria-label]="data.titleKey | translate"
    >
      <h2 class="dlg-title">{{ data.titleKey | translate }}</h2>
      <p class="dlg-msg">{{ data.messageKey | translate }}</p>
      <div class="dlg-actions">
        @if (data.cancelKey) {
          <button
            type="button"
            class="btn btn-ghost"
            data-testid="dialog-cancel"
            (click)="ref.close(false)"
          >
            {{ data.cancelKey | translate }}
          </button>
        }
        <button
          type="button"
          class="btn"
          [class.btn-danger-solid]="data.danger"
          [class.btn-primary]="!data.danger"
          data-testid="dialog-confirm"
          (click)="ref.close(true)"
        >
          {{ data.confirmKey ?? 'common.ok' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: min(420px, 92vw);
        padding: 22px;
        border-radius: var(--radius-lg, 14px);
        background: var(--color-surface);
        color: var(--color-text);
        box-shadow: 0 18px 50px rgb(0 0 0 / 0.35);
      }

      .dlg-title {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 700;
      }

      .dlg-msg {
        margin: 0 0 18px;
        line-height: 1.6;
        color: color-mix(in srgb, var(--color-text) 80%, transparent);
      }

      .dlg-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDialogComponent {
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<AppDialogData>(DIALOG_DATA);
}
