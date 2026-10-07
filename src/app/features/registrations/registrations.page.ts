import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { CentersService } from '../../core/api/centers.service';
import { GroupsService } from '../../core/api/groups.service';
import { RegistrationRequestsService } from '../../core/api/registration-requests.service';
import { apiErrorKey } from '../../core/api/api-errors';
import { AppDatePipe } from '../../shared/ui/app-date/app-date.pipe';
import { DropdownComponent, dropdownNumber } from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-registrations-page',
  standalone: true,
  imports: [
    TranslatePipe,
    DropdownComponent,
    EmptyStateComponent,
    PaginatorComponent,
    SpinnerComponent,
    AppDatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registrations.page.html',
  styleUrl: './registrations.page.scss',
})
export class RegistrationsPage {
  private readonly requestsSvc = inject(RegistrationRequestsService);
  private readonly centersSvc = inject(CentersService);
  private readonly groupsSvc = inject(GroupsService);

  readonly page = signal(1);
  private readonly tick = signal(0);

  /** Card currently in accept mode (center/group selection). */
  readonly acceptingId = signal<number | null>(null);
  readonly centerId = signal<number | null>(null);
  /** Optional group of the chosen center (teachers/students only). */
  readonly groupId = signal<number | null>(null);
  /** Two-step cancel: card armed for the confirming click. */
  readonly armingCancelId = signal<number | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly actionFailed = signal<string | null>(null);

  protected readonly num = dropdownNumber;

  readonly centers = toSignal(this.centersSvc.list().pipe(map((p) => p.data)), {
    initialValue: [],
  });
  readonly centerOptions = computed(() =>
    this.centers().map((c) => ({ value: c.id, label: c.name })),
  );

  /** Row currently being accepted (for the role-gated group picker). */
  protected readonly acceptingRow = computed(
    () => this.rows().find((r) => r.id === this.acceptingId()) ?? null,
  );
  protected readonly canPickGroup = computed(() =>
    ['teacher', 'student'].includes(this.acceptingRow()?.role ?? ''),
  );

  /** Groups of the picked center; reloads whenever the center changes. */
  private readonly groupsRes = resource({
    params: () => ({ centerId: this.centerId() }),
    loader: ({ params }) => {
      if (params.centerId === null) return Promise.resolve(null);
      return firstValueFrom(this.groupsSvc.list({ center_id: params.centerId, is_active: true }));
    },
  });

  protected readonly groupOptions = computed(() =>
    (this.groupsRes.value()?.data ?? []).map((g) => ({ value: g.id, label: g.name })),
  );

  private readonly query = resource({
    params: () => ({ p: this.page(), t: this.tick() }),
    loader: ({ params }) => firstValueFrom(this.requestsSvc.list({ page: params.p })),
  });

  readonly rows = () => this.query.value()?.data ?? [];
  readonly total = () => this.query.value()?.meta.total ?? 0;
  readonly perPage = () => this.query.value()?.meta.per_page ?? 20;
  readonly loading = () => this.query.isLoading();

  startAccept(id: number): void {
    this.acceptingId.set(id);
    this.centerId.set(null);
    this.groupId.set(null);
    this.armingCancelId.set(null);
    this.actionFailed.set(null);
  }

  cancelAccept(): void {
    this.acceptingId.set(null);
    this.centerId.set(null);
    this.groupId.set(null);
  }

  /** Center change invalidates any previously picked group. */
  protected onCenterChange(id: number | null): void {
    this.centerId.set(id);
    this.groupId.set(null);
  }

  confirmAccept(id: number): void {
    const centerId = this.centerId();
    if (centerId === null || this.busyId() !== null) return;
    this.busyId.set(id);
    this.actionFailed.set(null);
    this.requestsSvc.accept(id, centerId, this.groupId()).subscribe({
      next: () => {
        this.busyId.set(null);
        this.cancelAccept();
        this.refresh();
      },
      error: (err: unknown) => {
        this.busyId.set(null);
        this.actionFailed.set(apiErrorKey(err));
      },
    });
  }

  armCancel(id: number): void {
    this.armingCancelId.set(id);
    this.acceptingId.set(null);
    this.actionFailed.set(null);
  }

  disarmCancel(): void {
    this.armingCancelId.set(null);
  }

  confirmCancel(id: number): void {
    if (this.busyId() !== null) return;
    this.busyId.set(id);
    this.actionFailed.set(null);
    this.requestsSvc.remove(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.armingCancelId.set(null);
        this.refresh();
      },
      error: (err: unknown) => {
        this.busyId.set(null);
        this.actionFailed.set(apiErrorKey(err));
      },
    });
  }

  /** Reload the list; step back a page when the last row of a non-first page was removed. */
  private refresh(): void {
    const rows = this.query.value()?.data ?? [];
    if (rows.length === 1 && this.page() > 1) {
      this.page.update((p) => p - 1);
    } else {
      this.tick.update((n) => n + 1);
    }
  }
}
