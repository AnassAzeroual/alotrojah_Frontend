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
import { apiErrorKey } from '../../core/api/api-errors';
import { ReferenceService } from '../../core/api/reference.service';
import { CentersService } from '../../core/api/centers.service';
import { AuthService } from '../../core/auth/auth.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

interface StudentForm {
  full_name: FormControl<string>;
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
    ReactiveFormsModule,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './student-detail.page.html',
  styleUrl: './student-detail.page.scss',
})
export class StudentDetailPage {
  readonly id = input.required<string>(); // 'new' or number string

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
    params: () => ({ id: this.id(), t: this.tick() }),
    loader: ({ params }) =>
      params.id === 'new'
        ? Promise.resolve(null)
        : firstValueFrom(this.studentsSvc.get(Number(params.id))),
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
      params.season === null || params.id === 'new'
        ? Promise.resolve(null)
        : firstValueFrom(this.dash.season(Number(params.id), params.season)),
  });

  private readonly final = resource({
    params: () => ({ id: this.id(), season: this.season.value()?.id ?? null }),
    loader: ({ params }) =>
      params.season === null || params.id === 'new'
        ? Promise.resolve(null)
        : firstValueFrom(this.dash.final(Number(params.id), params.season)),
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
    loader: () => firstValueFrom(this.ref.levels()),
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
    center_id: new FormControl<number | null>(null),
    group_id: new FormControl<number | null>(null),
    level_id: new FormControl<number | null>(null),
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

  protected readonly groupOptions = computed<DropdownOption[]>(() => {
    const opts: DropdownOption[] = (this.groupsRes.value()?.data ?? []).map((g) => ({
      value: g.id,
      label: g.name,
    }));
    return [{ value: '', labelKey: 'studentDetail.no_group' }, ...opts];
  });

  // Assign block (view mode)
  protected readonly assignPicked = signal<number | null>(null);
  protected readonly assignChosen = signal(false);
  protected readonly assignSaving = signal(false);
  protected readonly assignFailed = signal<string | null>(null);
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
  protected readonly loading = () =>
    this.student.isLoading() || this.season.isLoading() || this.summary.isLoading();

  constructor() {
    // §2.1: on a single-center deployment the only center is pre-selected so
    // the group dropdown loads and the pupil can never be born center-less.
    effect(() => {
      const opts = this.centerOptions();
      if (this.isNew() && opts.length === 1 && this.form.controls.center_id.value === null) {
        this.form.controls.center_id.setValue(Number(opts[0].value));
      }
    });
    // Sync student to form when editing
    resource({
      params: () => ({ s: this.studentVal(), editing: this.editing() }),
      loader: async ({ params }) => {
        if (params.editing && params.s) {
          this.form.patchValue({
            full_name: params.s.full_name,
            center_id: params.s.center_id,
            group_id: params.s.group?.id ?? null,
            level_id: params.s.level_id,
            gender: params.s.gender as any,
            status: params.s.status,
            student_type: params.s.student_type,
            memorization_mode: params.s.memorization_mode,
            start_hizb: params.s.start_hizb,
            // API models might need notes in Student, let's keep it null if not present
            notes: (params.s as any).notes ?? null,
          });
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
      ? this.studentsSvc.create(v as any)
      : this.studentsSvc.update(this.studentVal()!.id, v);

    req$.subscribe({
      next: (res) => {
        this.assignSaving.set(false);
        if (this.isNew()) {
          this.router.navigate(['/students', res.id]);
        } else {
          this.editing.set(false);
          this.tick.update((n) => n + 1);
        }
      },
      error: (err: unknown) => {
        this.assignSaving.set(false);
        this.assignFailed.set(apiErrorKey(err));
      },
    });
  }

  protected onGroupPick(v: DropdownValue): void {
    this.assignPicked.set(this.num(v));
    this.assignChosen.set(true);
  }

  protected saveAssign(): void {
    const s = this.studentVal();
    if (!s || !this.assignChosen() || !this.isDirty() || this.assignSaving()) return;
    this.assignSaving.set(true);
    this.assignFailed.set(null);
    this.studentsSvc.update(s.id, { group_id: this.assignPicked() }).subscribe({
      next: () => {
        this.assignSaving.set(false);
        this.assignChosen.set(false);
        this.assignPicked.set(null);
        this.tick.update((n) => n + 1);
      },
      error: (err: unknown) => {
        this.assignSaving.set(false);
        this.assignFailed.set(apiErrorKey(err));
      },
    });
  }
}
