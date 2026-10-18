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
import { CentersService } from '../../core/api/centers.service';
import { AuthService } from '../../core/auth/auth.service';
import { leaveController } from '../../core/guards/leave-controller';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

interface StudentForm {
  full_name: FormControl<string>;
  user_id: FormControl<number | null>;
  center_id: FormControl<number | null>;
  group_id: FormControl<number | null>;
  level_id: FormControl<number | null>;
  gender: FormControl<'male' | 'female' | null>;
  student_type: FormControl<string | null>;
  memorization_mode: FormControl<'surah' | 'thumn'>;
  birth_date: FormControl<string | null>;
  start_hizb: FormControl<number | null>;
  status: FormControl<string>;
  notes: FormControl<string | null>;
}

@Component({
  selector: 'app-student-detail-page',
  standalone: true,
  imports: [
    TranslatePipe,
    DropdownComponent,
    EmptyStateComponent,
    SpinnerComponent,
    StatusBadgeComponent,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-detail.page.html',
  styleUrl: './student-detail.page.scss',
})
export class StudentDetailPage {
  readonly id = input.required<string>(); // 'new' or number string

  /**
   * Route id as a number, or null when the URL carries no numeric id (a stale
   * /students/NaN bookmark or a misbuilt link — live case 2026-10-17). All
   * three loaders short-circuit on null, so no HTTP fires and the template's
   * existing empty-state branch renders instead of the frozen skeleton.
   */
  private readonly numericId = computed((): number | null => {
    if (this.id() === 'new') return null;
    const n = Number(this.id());
    return Number.isNaN(n) ? null : n;
  });

  protected readonly num = dropdownNumber;

  readonly isNew = computed(() => this.id() === 'new');
  readonly editing = signal(false);
  readonly isFormOpen = computed(() => this.isNew() || this.editing());

  private readonly studentsSvc = inject(StudentsService);
  private readonly groupsSvc = inject(GroupsService);
  private readonly centersSvc = inject(CentersService);
  private readonly dash = inject(DashboardService);
  private readonly ref = inject(ReferenceService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly tick = signal(0);

  private readonly student = resource({
    params: () => ({ id: this.id(), nid: this.numericId(), t: this.tick() }),
    loader: ({ params }) =>
      params.id === 'new' || params.nid === null
        ? Promise.resolve(null)
        : firstValueFrom(this.studentsSvc.get(params.nid)),
  });

  private readonly season = resource({
    params: () => ({}),
    loader: () =>
      firstValueFrom(this.ref.seasons()).then(
        (r) => r.data.find((s) => s.is_current) ?? r.data[0] ?? null,
      ),
  });

  private readonly summary = resource({
    params: () => ({ nid: this.numericId(), season: this.season.value()?.id ?? null }),
    loader: ({ params }) =>
      params.nid === null || params.season === null
        ? Promise.resolve(null)
        : firstValueFrom(this.dash.season(params.nid, params.season)),
  });

  private readonly final = resource({
    params: () => ({ nid: this.numericId(), season: this.season.value()?.id ?? null }),
    loader: ({ params }) =>
      params.nid === null || params.season === null
        ? Promise.resolve(null)
        : firstValueFrom(this.dash.final(params.nid, params.season)),
  });

  // Group assignment (StudentPolicy: admin/supervisor, or a same-center teacher)

  // Form Options
  readonly genderOptions: DropdownOption[] = [
    { value: 'male', labelKey: 'gender.male' },
    { value: 'female', labelKey: 'gender.female' },
  ];
  readonly typeOptions: DropdownOption[] = [
    { value: 'child', labelKey: 'grp.type_child' },
    { value: 'adult', labelKey: 'grp.type_adult' },
  ];
  readonly modeOptions: DropdownOption[] = [
    { value: 'surah', labelKey: 'mode.surah' },
    { value: 'thumn', labelKey: 'mode.thumn' },
  ];
  readonly statusOptions: DropdownOption[] = [
    { value: 'active', labelKey: 'studentStatus.active' },
    { value: 'paused', labelKey: 'studentStatus.paused' },
    { value: 'graduated', labelKey: 'studentStatus.graduated' },
  ];

  private readonly levelsRes = resource({
    params: () => ({ c: this.formCenterId() ?? this.auth.currentUser()?.center_id ?? null }),
    loader: ({ params }) => firstValueFrom(this.ref.levels(params.c)),
  });
  readonly levelOptions = computed<DropdownOption[]>(() => {
    return (this.levelsRes.value() ?? []).map((l) => ({ value: l.id, label: l.name_ar }));
  });

  private readonly centersRes = resource({
    params: () => ({ allow: this.auth.role() === 'admin' || this.auth.role() === 'supervisor' }),
    loader: ({ params }) =>
      params.allow ? firstValueFrom(this.centersSvc.list()) : Promise.resolve(null),
  });
  readonly centerOptions = computed<DropdownOption[]>(() => {
    return (this.centersRes.value()?.data ?? []).map((c) => ({ value: c.id, label: c.name }));
  });
  /** The center is choosable (and effectively required) only for the admin. */
  protected readonly showCenterAdmin = computed(() => this.auth.role() === 'admin');

  // Form State
  readonly form = new FormGroup<StudentForm>({
    full_name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    user_id: new FormControl<number | null>(null, { validators: [Validators.required] }),
    center_id: new FormControl<number | null>(null),
    group_id: new FormControl<number | null>(null, { validators: [Validators.required] }),
    level_id: new FormControl<number | null>(null, { validators: [Validators.required] }),
    gender: new FormControl<'male' | 'female' | null>(null),
    student_type: new FormControl<string | null>(null),
    memorization_mode: new FormControl<'surah' | 'thumn'>('thumn', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    birth_date: new FormControl<string | null>(null),
    start_hizb: new FormControl<number | null>(null),
    status: new FormControl('active', { nonNullable: true, validators: [Validators.required] }),
    notes: new FormControl<string | null>(null),
  });

  readonly formCenterId = toSignal(this.form.controls.center_id.valueChanges);

  readonly canAssign = computed(() => {
    const role = this.auth.role();
    const s = this.studentVal();
    if (this.isNew()) return true; // Form mode handles auth via options
    if (!s || !role) return false;
    if (role === 'admin' || role === 'supervisor') return true;
    return (
      role === 'teacher' &&
      s.center_id !== null &&
      s.center_id === this.auth.currentUser()?.center_id
    );
  });

  private readonly groupsRes = resource({
    params: () => {
      // In form mode, use the form's center_id. Otherwise use student's center_id.
      let cid = this.isFormOpen() ? this.formCenterId() : this.studentVal()?.center_id;
      if (cid === undefined && this.isFormOpen()) cid = this.form.controls.center_id.value;
      if (cid === null || cid === undefined) cid = this.auth.currentUser()?.center_id ?? null;
      return { centerId: cid, allow: this.canAssign() };
    },
    loader: ({ params }) => {
      if (params.centerId === null || !params.allow) return Promise.resolve(null);
      return firstValueFrom(this.groupsSvc.list({ center_id: params.centerId, is_active: true }));
    },
  });

  protected readonly groupOptions = computed<DropdownOption[]>(() =>
    (this.groupsRes.value()?.data ?? []).map((g) => ({
      value: g.id,
      label: g.name,
    })),
  );

  /** Linkable login accounts for the pupil form (admin/supervisor/teacher). */
  private readonly accountsRes = resource({
    params: () => ({
      centerId:
        this.formCenterId() ??
        this.form.controls.center_id.value ??
        this.auth.currentUser()?.center_id ??
        null,
      open: this.isFormOpen(),
      // Admins browse all centers until one is picked (picking an account
      // then auto-sets it); everyone else is nailed to their own center.
      global: this.showCenterAdmin(),
    }),
    loader: ({ params }) =>
      params.open && (params.centerId !== null || params.global)
        ? firstValueFrom(this.studentsSvc.unlinkedAccounts(params.centerId))
        : Promise.resolve([]),
  });

  protected readonly accountOptions = computed<DropdownOption[]>(() =>
    (this.accountsRes.value() ?? []).map((u) => ({
      value: u.id,
      label: `${u.full_name} · ${u.email}`,
    })),
  );

  protected readonly linkedUser = computed(() => this.studentVal()?.user ?? null);

  /** Picking an account pre-fills the pupil name (until edited) + center. */
  protected onAccountPick(v: DropdownValue): void {
    const id = this.num(v);
    this.form.controls.user_id.setValue(id);
    if (id === null) return;
    const u = (this.accountsRes.value() ?? []).find((a) => a.id === id);
    if (!u) return;
    if (this.form.controls.full_name.value.trim() === '') {
      this.form.controls.full_name.setValue(u.full_name);
    }
    if (this.form.controls.center_id.value === null && u.center_id !== null) {
      this.form.controls.center_id.setValue(u.center_id);
    }
  }

  // Assign block (view mode)
  protected readonly assignPicked = signal<number | null>(null);
  protected readonly assignChosen = signal(false);
  protected readonly assignSaving = signal(false);
  protected readonly assignFailed = signal<string | null>(null);
  protected readonly currentGroupId = computed(() => this.studentVal()?.group?.id ?? null);
  protected readonly assignValue = computed<DropdownValue>(() =>
    this.assignChosen() ? (this.assignPicked() ?? '') : (this.currentGroupId() ?? ''),
  );
  protected readonly assignDirty = computed(() => {
    if (!this.assignChosen()) return false;
    return this.assignPicked() !== this.currentGroupId();
  });

  /** Dirty guard: unsaved form edits or a pending group assignment block leave. */
  protected readonly leave = leaveController();
  isDirty(): boolean {
    return this.form.dirty || this.assignDirty();
  }

  protected readonly studentVal = () => this.student.value() ?? null;
  protected readonly summaryVal = () => this.summary.value() ?? null;
  protected readonly finalVal = () => this.final.value() ?? null;
  protected readonly loading = () =>
    this.student.isLoading() || this.season.isLoading() || this.summary.isLoading();

  constructor() {
    // §2.1: on a single-center deployment the only center is pre-selected so
    // the group dropdown loads and the pupil can never be born center-less.
    effect(() => {
      const opts = this.centerOptions();
      if (this.isNew() && opts.length === 1 && this.form.controls.center_id.value === null) {
        this.form.controls.center_id.setValue(Number(opts[0].value));
        this.form.markAsPristine();
      }
    });
    // Sync student to form when editing
    resource({
      params: () => ({ s: this.studentVal(), editing: this.editing() }),
      loader: async ({ params }) => {
        if (params.editing && params.s) {
          this.form.patchValue({
            full_name: params.s.full_name,
            user_id: params.s.user?.id ?? null,
            center_id: params.s.center_id,
            group_id: params.s.group?.id ?? null,
            level_id: params.s.level_id,
            gender: params.s.gender as 'male' | 'female' | null,
            status: params.s.status,
            student_type: params.s.student_type,
            memorization_mode: params.s.memorization_mode,
            start_hizb: params.s.start_hizb,
            // API models might need notes in Student, let's keep it null if not present
            notes: params.s.notes ?? null,
          });
          this.form.markAsPristine();
        }
        return null;
      },
    });
  }

  protected startEdit(): void {
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    if (this.isNew()) {
      this.router.navigate(['/students']);
    } else {
      this.editing.set(false);
    }
  }

  protected submitForm(): void {
    if (this.form.invalid || this.assignSaving()) return;
    this.assignSaving.set(true);
    this.assignFailed.set(null);

    const v = this.form.getRawValue();
    const role = this.auth.role();
    // Teacher creates: force auth center
    if (this.isNew() && (role === 'teacher' || role === 'student')) {
      v.center_id = this.auth.currentUser()?.center_id ?? null;
    }
    // §2.1: admin/supervisor must not submit a center-less pupil. A single
    // center is auto-applied; with several, the selector is mandatory.
    if (this.isNew() && (role === 'admin' || role === 'supervisor') && v.center_id === null) {
      const opts = this.centerOptions();
      if (opts.length === 1) {
        v.center_id = Number(opts[0].value);
      } else {
        this.assignFailed.set('validation.required');
        return;
      }
    }

    const req$ = this.isNew()
      ? this.studentsSvc.create({ ...v, user_id: v.user_id! })
      : this.studentsSvc.update(this.studentVal()!.id, v);

    req$.subscribe({
      next: (res) => {
        this.assignSaving.set(false);
        this.form.markAsPristine();
        if (this.isNew()) {
          this.router.navigate(['/students', res.id]);
        } else {
          this.editing.set(false);
          this.tick.update((n) => n + 1);
        }
      },
      error: () => this.assignSaving.set(false),
    });
  }

  protected onGroupPick(v: DropdownValue): void {
    this.assignPicked.set(this.num(v));
    this.assignChosen.set(true);
  }

  protected onStartHizbInput(v: string): void {
    this.form.controls.start_hizb.setValue(v.trim() === '' ? null : Number(v));
  }

  protected saveAssign(): void {
    const s = this.studentVal();
    if (
      !s ||
      this.assignPicked() === null ||
      !this.assignChosen() ||
      !this.assignDirty() ||
      this.assignSaving()
    )
      return;
    this.assignSaving.set(true);
    this.assignFailed.set(null);
    this.studentsSvc.update(s.id, { group_id: this.assignPicked() }).subscribe({
      next: () => {
        this.assignSaving.set(false);
        this.assignChosen.set(false);
        this.assignPicked.set(null);
        this.tick.update((n) => n + 1);
      },
      error: () => this.assignSaving.set(false),
    });
  }
}
