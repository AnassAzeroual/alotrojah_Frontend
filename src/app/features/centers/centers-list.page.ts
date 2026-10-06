import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { CentersService } from '../../core/api/centers.service';
import { leaveController } from '../../core/guards/leave-controller';
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

const EMPTY_DRAFT: CenterDraft = { name: '', city: '', address: '', phone: '', manager: '' };

@Component({
  selector: 'app-centers-list-page',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TranslatePipe, EmptyStateComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './centers-list.page.html',
  styleUrl: './centers-list.page.scss',
})
export class CentersListPage {
  private readonly centersSvc = inject(CentersService);

  private readonly tick = signal(0);
  readonly saving = signal(false);
  readonly createErrorKey = signal<string | null>(null);
  readonly creating = signal(false);
  readonly createDraft = signal<CenterDraft>({ ...EMPTY_DRAFT });

  readonly editingId = signal<number | null>(null);
  readonly draft = signal<CenterDraft>({ ...EMPTY_DRAFT });
  /** Seed snapshot: an untouched edit row is clean even while open. */
  private readonly editSeed = signal<CenterDraft | null>(null);

  /** Dirty guard: typed-but-unsaved create/edit rows block route leave. */
  readonly leave = leaveController();
  isDirty(): boolean {
    if (this.creating()) {
      const d = this.createDraft();
      return (
        d.name.trim() !== '' ||
        d.city.trim() !== '' ||
        d.address.trim() !== '' ||
        d.phone.trim() !== '' ||
        d.manager.trim() !== ''
      );
    }
    if (this.editingId() === null) return false;
    const seed = this.editSeed();
    if (!seed) return true;
    const d = this.draft();
    return (
      d.name !== seed.name ||
      d.city !== seed.city ||
      d.address !== seed.address ||
      d.phone !== seed.phone ||
      d.manager !== seed.manager
    );
  }
  readonly editSaving = signal(false);
  readonly editErrorKey = signal<string | null>(null);

  readonly centers = resource({
    params: () => ({ t: this.tick() }),
    loader: () => firstValueFrom(this.centersSvc.list().pipe(map((p) => p.data))),
  });

  private clean(v: string, max: number): string | null {
    const t = v.trim();
    return t === '' ? null : t.slice(0, max);
  }

  startCreate(): void {
    this.editingId.set(null);
    this.createDraft.set({ ...EMPTY_DRAFT });
    this.createErrorKey.set(null);
    this.creating.set(true);
  }

  setCreate(field: keyof CenterDraft, value: string): void {
    this.createDraft.update((d) => ({ ...d, [field]: value }));
  }

  cancelCreate(): void {
    this.creating.set(false);
    this.createErrorKey.set(null);
  }

  saveCreate(): void {
    const d = this.createDraft();
    const name = d.name.trim();
    if (name === '' || name.length > 150 || this.saving()) return;
    this.saving.set(true);
    this.createErrorKey.set(null);
    this.centersSvc
      .create({
        name,
        city: this.clean(d.city, 100),
        address: this.clean(d.address, 255),
        phone: this.clean(d.phone, 30),
        manager_name: this.clean(d.manager, 150),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.creating.set(false);
          this.createDraft.set({ ...EMPTY_DRAFT });
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
    this.creating.set(false);
    this.editingId.set(id);
    this.draft.set({
      name: c.name,
      city: c.city ?? '',
      address: c.address ?? '',
      phone: c.phone ?? '',
      manager: c.manager_name ?? '',
    });
    this.editSeed.set({ ...this.draft() });
    this.editErrorKey.set(null);
  }

  setDraft(field: keyof CenterDraft, value: string): void {
    this.draft.update((d) => ({ ...d, [field]: value }));
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editSeed.set(null);
    this.editErrorKey.set(null);
  }

  saveEdit(id: number): void {
    const d = this.draft();
    const name = d.name.trim();
    if (name === '' || name.length > 150 || this.editSaving()) return;
    this.editSaving.set(true);
    this.editErrorKey.set(null);
    this.centersSvc
      .update(id, {
        name,
        city: this.clean(d.city, 100),
        address: this.clean(d.address, 255),
        phone: this.clean(d.phone, 30),
        manager_name: this.clean(d.manager, 150),
      })
      .subscribe({
        next: () => {
          this.editSaving.set(false);
          this.editingId.set(null);
          this.editSeed.set(null);
          this.tick.update((n) => n + 1);
        },
        error: (err: unknown) => {
          this.editSaving.set(false);
          this.editErrorKey.set(apiErrorKey(err));
        },
      });
  }
}
