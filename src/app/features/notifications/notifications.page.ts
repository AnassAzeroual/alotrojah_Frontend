import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { NotificationsService } from '../../core/api/notifications.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, SpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications.page.html',
})
export class NotificationsPage {
  private readonly outbox = inject(NotificationsService);
  private readonly tick = signal(0);
  readonly saving = signal(false);

  readonly items = resource({
    params: () => ({ t: this.tick() }),
    loader: () => firstValueFrom(this.outbox.list().pipe(map((p) => p.data))),
  });

  readonly form = new FormGroup({
    recipient_phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(30)] }),
    message: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
  });

  queue(): void {
    if (this.form.invalid || this.saving()) return;
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.outbox.queue(v.recipient_phone, v.message).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.tick.update((n) => n + 1);
      },
      error: () => this.saving.set(false),
    });
  }

  mark(id: number, status: 'sent' | 'failed'): void {
    this.outbox.mark(id, status).subscribe(() => this.tick.update((n) => n + 1));
  }

  remove(id: number): void {
    this.outbox.remove(id).subscribe(() => this.tick.update((n) => n + 1));
  }
}
