import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
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

/** Loaded-state snapshot for the edit-mode dirty comparison. */
interface GroupEditSeed {
  name: string;
  levelId: number | null;
  teacherId: number | null;
  capacity: number | null;
  days: string;
  active: boolean;
}

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
  protected readonly active = signal(true);

  /** Edit mode: router binds :id via withComponentInputBinding (`/groups/new` has none). */
  readonly id = input<number | null, string | null>(null, {
    transform: (v: string | null) => (v === null || v === '' ? null : Number(v)),
  });
  protected readonly editId = computed(() => {
    const v = this.id();
    return v !== null && Number.isInteger(v) && v > 0 ? v : null;
  });
  protected readonly isNew = computed(() => this.editId() === null);

  /** Only admins choose the center; supervisors are scoped server-side. */
  protected readonly isAdmin = computed(() => this.auth.role() === 'admin');

  /** Supervisor's own center — drives the same-center teacher picker. */
  protected readonly effectiveCenterId = computed(() =>
    this.isAdmin() ? this.centerId() : (this.auth.currentUser()?.center_id ?? null),
  );

  /** Dirty guard: any filled composer field blocks route leave. */
  protected readonly leave = leaveController();
  isDirty(): boolean {
    const seed = this.editSeed();
    if (this.editId() !== null) {
      // Edit mode compares against the loaded snapshot (centers/levels
      // row-edit pattern); an unloaded form counts as dirty.
      if (!seed) return true;
      const cur = this.snapshot();
      return (
        cur.name !== seed.name ||
        cur.levelId !== seed.levelId ||
        cur.teacherId !== seed.teacherId ||
        cur.capacity !== seed.capacity ||
        cur.days !== seed.days ||
        cur.active !== seed.active
      );
    }
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

  /** Edit mode: load the group once, then seed the composer (never clobber user edits on refires). */
  private readonly editSeed = signal<GroupEditSeed | null>(null);
  private readonly seededFor = signal<number | null>(null);
  private readonly detailRes = resource({
    params: () => ({ id: this.editId() }),
    loader: ({ params }) =>
      params.id === null ? Promise.resolve(null) : firstValueFrom(this.groupsSvc.detail(params.id)),
  });

  constructor() {
    effect(() => {
      const id = this.editId();
      const g = this.detailRes.value()?.group;
      if (id === null || !g || this.seededFor() === id) return;
      this.name.set(g.name);
      this.centerId.set(g.center_id);
      this.levelId.set(g.level?.id ?? null);
      this.teacherId.set(g.teacher?.id ?? null);
      this.capacity.set(g.capacity);
      this.days.set(g.schedule_days ? g.schedule_days.split(',').filter((d) => d !== '') : []);
      this.active.set(g.is_active);
      this.editSeed.set(this.snapshot());
      this.seededFor.set(id);
    });
  }

  private snapshot(): GroupEditSeed {
    return {
      name: this.name().trim(),
      levelId: this.levelId(),
      teacherId: this.teacherId(),
      capacity: this.capacity(),
      days: this.days().join(','),
      active: this.active(),
    };
  }

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
    const id = this.editId();
    if (id === null) {
      this.submitCreate();
      return;
    }
    this.saving.set(true);
    this.saveFailed.set(null);
    this.groupsSvc
      .update(id, {
        name: this.name().trim(),
        level_id: this.levelId()!,
        teacher_id: this.teacherId(),
        capacity: this.capacity(),
        schedule_days: this.days().join(','),
        is_active: this.active(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          // Re-snapshot so the guard is clean for the ride back to detail.
          this.editSeed.set(this.snapshot());
          void this.router.navigate(['/groups', id]);
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.saveFailed.set(apiErrorKey(err));
        },
      });
  }

  private submitCreate(): void {
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
