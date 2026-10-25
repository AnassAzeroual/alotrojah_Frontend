import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminPrefsService } from '../../settings/admin-prefs.service';
import { SetupGuideService, SetupStep } from '../../settings/setup-guide.service';

/**
 * Admin first-run guide panel. Rendered by the shell; visibility is owned by
 * {@link SetupGuideService} so the header button and Settings can both open it.
 */
@Component({
  selector: 'app-setup-guide',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './setup-guide.component.html',
  styleUrl: './setup-guide.component.scss',
  host: { '(document:keydown.escape)': 'guide.hide()' },
})
export class SetupGuideComponent {
  readonly guide = inject(SetupGuideService);
  readonly prefs = inject(AdminPrefsService);

  protected titleKey(step: SetupStep): string {
    return `setup.steps.${step.key}.title`;
  }

  protected descKey(step: SetupStep): string {
    return `setup.steps.${step.key}.desc`;
  }

  protected toggleAuto(event: Event): void {
    this.prefs.setSetupGuideEnabled((event.target as HTMLInputElement).checked);
  }
}
