import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { CentersService } from '../../core/api/centers.service';
import { apiErrorKey } from '../../core/api/api-errors';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

interface CenterDraft {
  name: string;
  city: string;
  address: string;
  phone: string;
  manager: string;
}

@Component({
  selector: 'app-centers-list-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, EmptyStateComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './centers-list.page.html',
  styleUrl: './centers-list.page.scss',
})
export class CentersListPage {
  private readonly centersSvc = inject(CentersService);

  private readonly tick = signal(0);
  readonly saving = signal(false);
  readonly createErrorKey = signal<string | null>(null);

  readonly editingId = signal<number | null>(null);
  readonly draft = signal<CenterDraft>({
    name: '',
    city: '',
    address: '',
    phone: '',
    manager: '',
  });
  readonly editSaving = signal(false);
  readonly editErrorKey = signal<string | null>(null);

  readonly centers = resource({
    params: () => ({ t: this.tick() }),
    loader: () => firstValueFrom(this.centersSvc.list().pipe(map((p) => p.data))),
  });

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    city: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
    manager_name: new FormControl('', { nonNullable: true }),
  });

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.createErrorKey.set(null);
    this.centersSvc
      .create({
        name: v.name.trim(),
        city: v.city.trim() || null,
        phone: v.phone.trim() || null,
        manager_name: v.manager_name.trim() || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form.reset();
          this.tick.update((n) => n + 1);
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.createErrorKey.set(apiErrorKey(err));
        },
      });
  }

  startEdit(
    id: number,
    c: {
      name: string;
      city?: string | null;
      address?: string | null;
      phone?: string | null;
      manager_name?: string | null;
    },
  ): void {
    this.editingId.set(id);
    this.draft.set({
      name: c.name,
      city: c.city ?? '',
      address: c.address ?? '',
      phone: c.phone ?? '',
      manager: c.manager_name ?? '',
    });
    this.editErrorKey.set(null);
  }

  setDraft(field: keyof CenterDraft, value: string): void {
    this.draft.update((d) => ({ ...d, [field]: value }));
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editErrorKey.set(null);
  }

  saveEdit(id: number): void {
    const d = this.draft();
    const name = d.name.trim();
    if (name === '' || name.length > 150 || this.editSaving()) return;
    this.editSaving.set(true);
    this.editErrorKey.set(null);
    const opt = (v: string, max: number): string | null => {
      const t = v.trim();
      return t === '' ? null : t.slice(0, max);
    };
    this.centersSvc
      .update(id, {
        name,
        city: opt(d.city, 100),
        address: opt(d.address, 255),
        phone: opt(d.phone, 30),
        manager_name: opt(d.manager, 150),
      })
      .subscribe({
        next: () => {
          this.editSaving.set(false);
          this.editingId.set(null);
          this.tick.update((n) => n + 1);
        },
        error: (err: unknown) => {
          this.editSaving.set(false);
          this.editErrorKey.set(apiErrorKey(err));
        },
      });
  }
}
