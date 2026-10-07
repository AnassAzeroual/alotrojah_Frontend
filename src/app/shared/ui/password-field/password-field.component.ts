import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Shared password field (login eye pattern for every password input).
 * Reuses the global `.auth-input` geometry so auth pages look identical;
 * the host is a plain block so it also slots into `.field` labels.
 */
@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './password-field.component.html',
  styleUrl: './password-field.component.scss',
})
export class PasswordFieldComponent {
  readonly control = input.required<FormControl<string>>();
  readonly testId = input('password');
  readonly autocomplete = input('current-password');
  readonly textKey = input('auth.password');
  /** Visible label above the input; null = placeholder-only (auth pages). */
  readonly labelKey = input<string | null>(null);
  readonly required = input(false);

  protected readonly show = signal(false);
}
