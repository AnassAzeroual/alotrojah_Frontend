import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
  effect,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { CentersService } from '../../core/api/centers.service';
import { UsersService } from '../../core/api/users.service';
import { apiErrorKey } from '../../core/api/api-errors';
import { AuthService } from '../../core/auth/auth.service';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
} from '../../shared/ui/dropdown/dropdown.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { PasswordFieldComponent } from '../../shared/ui/password-field/password-field.component';
import { leaveController } from '../../core/guards/leave-controller';
import { Role, TeacherType } from '../../core/api/api-models';

interface UserForm {
  full_name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  phone: FormControl<string>;
  role: FormControl<Role | null>;
  center_id: FormControl<number | null>;
  teacher_type: FormControl<TeacherType | null>;
  is_active: FormControl<boolean>;
}

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    DropdownComponent,
    SpinnerComponent,
    PasswordFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-detail.page.html',
  styleUrl: './user-detail.page.scss',
})
export class UserDetailPage {
  readonly id = input.required<string>(); // 'new' or number

  private readonly usersSvc = inject(UsersService);
  private readonly centersSvc = inject(CentersService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly errorKey = signal<string | null>(null);

  readonly isNew = computed(() => this.id() === 'new');
  readonly isAdmin = computed(() => this.auth.role() === 'admin');
  /** Own row: non-admins confirm self-deactivation; admins get a locked box. */
  readonly isSelf = computed(() => {
    const me = this.auth.currentUser();
    return !this.isNew() && me !== null && Number(this.id()) === me.id;
  });
  readonly selfAdminLock = computed(() => {
    const me = this.auth.currentUser();
    return this.isSelf() && me?.role === 'admin';
  });
  readonly armingSelfOff = signal(false);

  /** Dirty guard: any unsaved edit blocks route leave (confirmed inline). */
  readonly leave = leaveController();
  isDirty = (): boolean => this.form.dirty;
  protected readonly num = dropdownNumber;

  readonly roleOptions: DropdownOption[] = [
    { value: 'admin', labelKey: 'role.admin' },
    { value: 'supervisor', labelKey: 'role.supervisor' },
    { value: 'teacher', labelKey: 'role.teacher' },
    { value: 'student', labelKey: 'role.student' },
    { value: 'board', labelKey: 'role.board' },
  ];

  readonly teacherTypeOptions: DropdownOption[] = [
    { value: 'hifz', labelKey: 'teacher_type.hifz' },
    { value: 'murajaa', labelKey: 'teacher_type.murajaa' },
    { value: 'both', labelKey: 'teacher_type.both' },
  ];

  readonly form = new FormGroup<UserForm>({
    full_name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true }), // Required conditionally
    phone: new FormControl('', { nonNullable: true }),
    role: new FormControl<Role | null>(null, Validators.required),
    center_id: new FormControl<number | null>(null),
    teacher_type: new FormControl<TeacherType | null>(null),
    is_active: new FormControl(true, { nonNullable: true }),
  });

  private readonly centersRes = resource({
    params: () => ({ allow: this.isAdmin() }),
    loader: ({ params }) =>
      params.allow ? firstValueFrom(this.centersSvc.list()) : Promise.resolve(null),
  });

  readonly centerOptions = computed<DropdownOption[]>(() => {
    const data = this.centersRes.value()?.data ?? [];
    return [
      { value: '', labelKey: 'registrations.pick_center' },
      ...data.map((c) => ({ value: c.id, label: c.name })),
    ];
  });

  readonly isTeacher = signal(false);
  /** Center is required for every role except admin — but only when the
   * creator can see the field (admin creator). Supervisors never see it:
   * the backend forces their own center on store. (§2.8) */
  readonly centerRequired = signal(false);

  private readonly userRes = resource({
    params: () => ({ id: this.id() }),
    loader: async ({ params }) => {
      if (params.id === 'new') return null;
      return firstValueFrom(this.usersSvc.get(Number(params.id)));
    },
  });

  readonly loading = () => this.userRes.isLoading() || this.centersRes.isLoading();

  constructor() {
    effect(() => {
      if (this.isNew()) {
        this.form.controls.password.addValidators([Validators.required, Validators.minLength(8)]);
      } else {
        this.form.controls.password.clearValidators();
      }
      this.form.controls.password.updateValueAndValidity();
    });

    effect(() => {
      const u = this.userRes.value();
      if (u && !this.isNew()) {
        this.form.patchValue({
          full_name: u.full_name,
          email: u.email,
          phone: u.phone ?? '',
          role: u.role,
          center_id: u.center_id,
          teacher_type: u.teacher_type,
          is_active: u.is_active,
        });
        this.form.markAsPristine();
      }
    });

    this.form.controls.role.valueChanges.subscribe((r) => {
      this.isTeacher.set(r === 'teacher');
      const tt = this.form.controls.teacher_type;
      if (r === 'teacher') {
        tt.addValidators(Validators.required);
      } else {
        tt.clearValidators();
        tt.setValue(null);
      }
      tt.updateValueAndValidity();
      const cc = this.form.controls.center_id;
      this.centerRequired.set(this.isAdmin() && r !== null && r !== 'admin');
      if (this.centerRequired()) {
        cc.addValidators(Validators.required);
      } else {
        cc.clearValidators();
      }
      cc.updateValueAndValidity();
    });

    // Own admin row: the Active box is locked (no surprise self-deactivation).
    effect(() => {
      const ctl = this.form.controls.is_active;
      if (this.selfAdminLock() && ctl.enabled) ctl.disable();
      if (!this.selfAdminLock() && ctl.disabled) ctl.enable();
    });
  }

  onActiveChange(checked: boolean): void {
    if (!checked && this.isSelf() && !this.selfAdminLock()) {
      // Self-deactivation arms a confirm step: leave the box unchecked while
      // armed (reverting here makes the control unclickable to assistive tech
      // and to Playwright's check/uncheck assertions).
      this.armingSelfOff.set(true);
      return;
    }
    this.armingSelfOff.set(false);
  }

  confirmSelfOff(): void {
    this.armingSelfOff.set(false);
    this.form.controls.is_active.setValue(false);
    this.submit();
  }

  cancelSelfOff(): void {
    // Restore the checked box so cancelling returns to a clean state.
    this.form.controls.is_active.setValue(true);
    this.armingSelfOff.set(false);
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.errorKey.set(null);

    const v = this.form.getRawValue();
    if (!v.role) return;

    const req$ = this.isNew()
      ? this.usersSvc.create({
          full_name: v.full_name,
          email: v.email,
          password: v.password,
          role: v.role,
          phone: v.phone || null,
          center_id: v.center_id,
          teacher_type: v.teacher_type || undefined,
          is_active: v.is_active,
        })
      : this.usersSvc.update(Number(this.id()), {
          full_name: v.full_name,
          email: v.email,
          password: v.password || null,
          role: v.role,
          phone: v.phone || null,
          center_id: v.center_id,
          teacher_type: v.teacher_type || undefined,
          is_active: v.is_active,
        });

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.form.markAsPristine();
        if (this.isSelf() && this.form.getRawValue().is_active === false) {
          // Self-deactivated: drop the session immediately.
          this.auth.clearLocal();
          void this.router.navigate(['/login']);
          return;
        }
        this.router.navigate(['/users']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorKey.set(apiErrorKey(err));
      },
    });
  }
}
