import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="spin" role="status" aria-label="loading"></span>`,
  styles: [
    `
      .spin {
        display: inline-block;
        width: 22px;
        height: 22px;
        border: 3px solid var(--color-muted);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: rot 0.8s linear infinite;
      }
      @keyframes rot {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class SpinnerComponent {}
