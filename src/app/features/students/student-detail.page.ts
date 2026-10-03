import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from '../../core/api/dashboard.service';
import { GroupsService } from '../../core/api/groups.service';
import {
  DropdownComponent,
  DropdownOption,
  DropdownValue,
  dropdownNumber,
} from '../../shared/ui/dropdown/dropdown.component';
import { StudentsService } from '../../core/api/students.service';
import { ReferenceService } from '../../core/api/reference.service';
import { AuthService } from '../../core/auth/auth.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-student-detail-page',
  standalone: true,
  imports: [
    TranslatePipe,
    DropdownComponent,
    EmptyStateComponent,
    SpinnerComponent,
    StatusBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-detail.page.html',
  styleUrl: './student-detail.page.scss',
})
export class StudentDetailPage {
  readonly id = input.required<number, string>({ transform: (v: string) => Number(v) });

  protected readonly num = dropdownNumber;

  private readonly studentsSvc = inject(StudentsService);
  private readonly groupsSvc = inject(GroupsService);
  private readonly dash = inject(DashboardService);
  private readonly ref = inject(ReferenceService);
  private readonly auth = inject(AuthService);

  private readonly tick = signal(0);

  private readonly student = resource({
    params: () => ({ id: this.id(), t: this.tick() }),
    loader: ({ params }) => firstValueFrom(this.studentsSvc.get(params.id)),
  });

  private readonly season = resource({
    params: () => ({}),
    loader: () =>
      firstValueFrom(this.ref.seasons()).then(
        (r) => r.data.find((s) => s.is_current) ?? r.data[0] ?? null,
      ),
  });

  private readonly summary = resource({
    params: () => ({ id: this.id(), season: this.season.value()?.id ?? null }),
    loader: ({ params }) =>
      params.season === null
        ? Promise.resolve(null)
        : firstValueFrom(this.dash.season(params.id, params.season)),
  });

  private readonly final = resource({
    params: () => ({ id: this.id(), season: this.season.value()?.id ?? null }),
    loader: ({ params }) =>
      params.season === null
        ? Promise.resolve(null)
        : firstValueFrom(this.dash.final(params.id, params.season)),
  });

  // Group assignment (StudentPolicy: admin/supervisor, or a same-center teacher)

  protected readonly canAssign = computed(() => {
    const role = this.auth.role();
    const s = this.studentVal();
    if (!s || !role) return false;
    if (role === 'admin' || role === 'supervisor') return true;
    return (
      role === 'teacher' &&
      s.center_id !== null &&
      s.center_id === this.auth.currentUser()?.center_id
    );
  });

  private readonly groupsRes = resource({
    params: () => ({ centerId: this.studentVal()?.center_id ?? null, allow: this.canAssign() }),
    loader: ({ params }) => {
      if (params.centerId === null || !params.allow) return Promise.resolve(null);
      return firstValueFrom(this.groupsSvc.list({ center_id: params.centerId, is_active: true }));
    },
  });

  protected readonly groupOptions = computed<DropdownOption[]>(() => {
    const opts: DropdownOption[] = (this.groupsRes.value()?.data ?? []).map((g) => ({
      value: g.id,
      label: g.name,
    }));
    return [{ value: '', labelKey: 'studentDetail.no_group' }, ...opts];
  });

  /** Picked group id; null means the empty option (ungroup). */
  protected readonly assignPicked = signal<number | null>(null);
  /** Whether the user picked anything at all (null picked is a real choice). */
  protected readonly assignChosen = signal(false);
  protected readonly assignSaving = signal(false);
  protected readonly assignFailed = signal(false);

  protected readonly currentGroupId = computed(() => this.studentVal()?.group?.id ?? null);

  protected readonly assignValue = computed<DropdownValue>(() =>
    this.assignChosen() ? (this.assignPicked() ?? '') : (this.currentGroupId() ?? ''),
  );

  protected readonly isDirty = computed(() => {
    if (!this.assignChosen()) return false;
    return this.assignPicked() !== this.currentGroupId();
  });

  protected readonly studentVal = () => this.student.value() ?? null;
  protected readonly summaryVal = () => this.summary.value() ?? null;
  protected readonly finalVal = () => this.final.value() ?? null;
  // season must be part of the gate: summary/final resolve null while the
  // season id is unknown, then re-fire when it lands — without this the page
  // flashes content, then skeletons again (params re-fire on new identity).
  protected readonly loading = () =>
    this.student.isLoading() || this.season.isLoading() || this.summary.isLoading();

  protected onGroupPick(v: DropdownValue): void {
    this.assignPicked.set(this.num(v));
    this.assignChosen.set(true);
  }

  protected saveAssign(): void {
    const s = this.studentVal();
    if (!s || !this.assignChosen() || !this.isDirty() || this.assignSaving()) return;
    this.assignSaving.set(true);
    this.assignFailed.set(false);
    this.studentsSvc.update(s.id, { group_id: this.assignPicked() }).subscribe({
      next: () => {
        this.assignSaving.set(false);
        this.assignChosen.set(false);
        this.assignPicked.set(null);
        this.tick.update((n) => n + 1);
      },
      error: () => {
        this.assignSaving.set(false);
        this.assignFailed.set(true);
      },
    });
  }
}
