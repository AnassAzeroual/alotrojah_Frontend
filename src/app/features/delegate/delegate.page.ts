import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { DelegationsService, GeneratedDelegation } from '../../core/api/delegations.service';
import { GroupsService } from '../../core/api/groups.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-delegate-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, SpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delegate.page.html',
})
export class DelegatePage {
  private readonly delegations = inject(DelegationsService);
  private readonly groupsSvc = inject(GroupsService);

  readonly pickedGroup = signal<number | null>(null);
  readonly saving = signal(false);
  readonly generated = signal<GeneratedDelegation | null>(null);
  private readonly tick = signal(0);

  readonly groups = resource({
    params: () => ({}),
    loader: () => firstValueFrom(this.groupsSvc.list().pipe(map((p) => p.data))),
  });

  readonly existing = resource({
    params: () => ({ g: this.pickedGroup(), t: this.tick() }),
    loader: ({ params }) =>
      params.g === null ? Promise.resolve([]) : firstValueFrom(this.delegations.forGroup(params.g)),
  });

  readonly form = new FormGroup({
    minutes: new FormControl(30, { nonNullable: true, validators: [Validators.required] }),
  });

  generate(): void {
    const g = this.pickedGroup();
    if (g === null || this.saving()) return;
    this.saving.set(true);
    this.delegations.generate(g, this.form.controls.minutes.value).subscribe({
      next: (d) => {
        this.saving.set(false);
        this.generated.set(d);
        this.tick.update((n) => n + 1);
      },
      error: () => this.saving.set(false),
    });
  }

  revoke(id: number): void {
    this.delegations.revoke(id).subscribe(() => this.tick.update((n) => n + 1));
  }

  waLink(link: string): string {
    return `https://wa.me/?text=${encodeURIComponent(link)}`;
  }

  copy(link: string): void {
    void navigator.clipboard?.writeText(link);
  }
}
