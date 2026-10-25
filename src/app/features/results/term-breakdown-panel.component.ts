import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { V1TermBreakdownResponse } from '../../core/api/models';

export type BreakdownMetric = 'hifz' | 'murajaa' | 'exam' | 'general';

@Component({
  selector: 'app-term-breakdown-panel',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './term-breakdown-panel.component.html',
  styleUrl: './term-breakdown-panel.component.scss',
})
export class TermBreakdownPanelComponent {
  readonly metric = input.required<BreakdownMetric>();
  readonly data = input<V1TermBreakdownResponse['data'] | null>(null);
  readonly loading = input(false);
  readonly closed = output<void>();
}
