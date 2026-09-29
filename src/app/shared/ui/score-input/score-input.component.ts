import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
  selector: 'app-score-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="score">
      <input
        class="score-input"
        type="number"
        inputmode="decimal"
        [min]="0"
        [max]="max()"
        step="0.5"
        [value]="value() ?? ''"
        [disabled]="disabled()"
        (input)="onInput($event)"
      />
      <span class="muted">/ {{ max() }}</span>
    </label>
  `,
  styles: [
    `
      .score {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
      }
      .score-input {
        width: 72px;
        padding: var(--space-2);
        border: 1px solid #cfd6d2;
        border-radius: var(--radius-sm);
      }
    `,
  ],
})
export class ScoreInputComponent {
  readonly value = model<number | null>(null);
  readonly max = input.required<number>();
  readonly disabled = input(false);

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.value.set(raw === '' ? null : Number(raw));
  }
}
