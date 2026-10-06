import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { CentersService } from '../../core/api/centers.service';
import { GroupsService } from '../../core/api/groups.service';
import { apiErrorKey } from '../../core/api/api-errors';
import { ReferenceService, Level } from '../../core/api/reference.service';
import { UsersService } from '../../core/api/users.service';
import { AuthService } from '../../core/auth/auth.service';
import { leaveController } from '../../core/guards/leave-controller';
import {
  DropdownComponent,
  dropdownNumber,
  DropdownOption,
} from '../../shared/ui/dropdown/dropdown.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

const WEEKDAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

@Component({
  selector: 'app-group-form-page',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, DropdownComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-form.page.html',
  styleUrl: './group-form.page.scss',
})
export class GroupFormPage {
  protected readonly num = dropdownNumber;
  protected readonly weekdayKeys = WEEKDAY_KEYS;

  private readonly groupsSvc = inject(GroupsService);
  private readonly refSvc = inject(ReferenceService);
  private readonly centersSvc = inject(CentersService);
  private readonly usersSvc = inject(UsersService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly saveFailed = signal<string | null>(null);

  protected readonly name = signal('');
  protected readonly centerId = signal<number | null>(null);
  protected readonly levelId = signal<number | null>(null);
  protected readonly teacherId = signal<number | null>(null);
  protected readonly capacity = signal<number | null>(null);
  protected readonly days = signal<string[]>([]);

  /** Only admins choose the center; supervisors are scoped server-side. */
  protected readonly isAdmin = computed(() => this.auth.role() === 'admin');

  /** Supervisor's own center — drives the same-center teacher picker. */
  protected readonly effectiveCenterId = computed(() =>
    this.isAdmin() ? this.centerId() : (this.auth.currentUser()?.center_id ?? null),
  );

  /** Dirty guard: any filled composer field blocks route leave. */
  protected readonly leave = leaveController();
  isDirty(): boolean {
    return (
      this.name().trim() !== '' ||
      this.centerId() !== null ||
      this.levelId() !== null ||
      this.teacherId() !== null ||
      this.capacity() !== null ||
      this.days().length > 0
    );
  }

  protected readonly canSave = computed(
    () =>
      this.name().trim() !== '' &&
      this.levelId() !== null &&
      (!this.isAdmin() || this.centerId() !== null) &&
      !this.saving(),
  );

  private readonly levelsRes = resource({
    params: () => ({ centerId: this.effectiveCenterId() }),
    loader: ({ params }) => firstValueFrom(this.refSvc.levels(params.centerId)),
  });

  protected readonly levelOptions = computed<DropdownOption[]>(() =>
    (this.levelsRes.value() ?? []).map((l: Level) => ({ value: l.id, label: l.name_ar })),
  );

  private readonly centersRes = resource({
    params: () => ({ allow: this.isAdmin() }),
    loader: ({ params }) =>
      params.allow ? firstValueFrom(this.centersSvc.list()) : Promise.resolve(null),
  });

  protected readonly centerOptions = computed<DropdownOption[]>(() => {
    const data = this.centersRes.value()?.data ?? [];
    return [
      { value: '', labelKey: 'registrations.pick_center' },
      ...data.map((c) => ({ value: c.id, label: c.name })),
    ];
  });

  private readonly teachersRes = resource({
    params: () => ({ centerId: this.effectiveCenterId() }),
    loader: ({ params }) => {
      if (params.centerId === null) return Promise.resolve([]);
      return this.usersSvc.listAll({ role: 'teacher', center_id: params.centerId });
    },
  });

  protected readonly teacherOptions = computed<DropdownOption[]>(() => {
    const opts: DropdownOption[] = (this.teachersRes.value() ?? []).map((u) => ({
      value: u.id,
      label: u.full_name,
    }));
    return [{ value: '', labelKey: 'grp.no_teacher' }, ...opts];
  });

  protected onCenterChange(v: number | null): void {
    // Teachers are center-scoped, so switching centers invalidates the pick.
    this.teacherId.set(null);
    this.centerId.set(v);
  }

  protected toggleDay(day: string): void {
    this.days.update((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day]));
  }

  protected onCapacityInput(v: string): void {
    if (v.trim() === '') {
      this.capacity.set(null);
      return;
    }
    const n = Number(v);
    this.capacity.set(Number.isNaN(n) ? null : n);
  }

  protected submit(): void {
    if (!this.canSave()) return;
    this.saving.set(true);
    this.saveFailed.set(null);
    this.groupsSvc
      .create({
        name: this.name().trim(),
        center_id: this.effectiveCenterId(),
        level_id: this.levelId()!,
        teacher_id: this.teacherId(),
        capacity: this.capacity(),
        schedule_days: this.days().join(','),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.name.set('');
          this.centerId.set(null);
          this.levelId.set(null);
          this.teacherId.set(null);
          this.capacity.set(null);
          this.days.set([]);
          void this.router.navigate(['/groups']);
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.saveFailed.set(apiErrorKey(err));
        },
      });
  }
}
