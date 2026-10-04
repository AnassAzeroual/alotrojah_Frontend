import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { RegisterPayload, RegisterRole, TeacherType } from '../../core/api/api-models';
import { DropdownComponent, DropdownOption } from '../../shared/ui/dropdown/dropdown.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';
import { AuthArtComponent } from './auth-art.component';
import { AuthTopbarComponent } from './auth-topbar.component';

interface RegisterForm {
  full_name: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  role: FormControl<RegisterRole | null>;
  teacher_type: FormControl<TeacherType | null>;
  birth_date: FormControl<string>;
  gender: FormControl<'male' | 'female' | null>;
  password: FormControl<string>;
  passwordConfirm: FormControl<string>;
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('passwordConfirm')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

type RegisterErrorCode = 'email_taken' | 'in_waiting_room' | 'invalid';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    DropdownComponent,
    SpinnerComponent,
    AuthArtComponent,
    AuthTopbarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly errorCode = signal<RegisterErrorCode | null>(null);
  readonly showPw = signal(false);
  readonly showPwConfirm = signal(false);
  readonly isTeacher = signal(false);
  readonly isStudent = signal(false);
  readonly today = new Date().toISOString().slice(0, 10);

  readonly errorKey = computed(() => {
    const code = this.errorCode();
    if (code === 'email_taken') return 'auth.email_taken';
    if (code === 'in_waiting_room') return 'auth.in_waiting_room';
    return code === null ? null : 'auth.invalid';
  });

  readonly roleOptions: DropdownOption[] = [
    { value: 'teacher', labelKey: 'role.teacher' },
    { value: 'student', labelKey: 'role.student' },
    { value: 'supervisor', labelKey: 'role.supervisor' },
    { value: 'board', labelKey: 'role.board' },
  ];
  readonly teacherTypeOptions: DropdownOption[] = [
    { value: 'hifz', labelKey: 'teacher_type.hifz' },
    { value: 'murajaa', labelKey: 'teacher_type.murajaa' },
    { value: 'both', labelKey: 'teacher_type.both' },
  ];
  readonly genderOptions: DropdownOption[] = [
    { value: 'male', labelKey: 'gender.male' },
    { value: 'female', labelKey: 'gender.female' },
  ];

  readonly form = new FormGroup<RegisterForm>(
    {
      full_name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      role: new FormControl<RegisterRole | null>(null, Validators.required),
      teacher_type: new FormControl<TeacherType | null>(null),
      birth_date: new FormControl('', { nonNullable: true }),
      gender: new FormControl<'male' | 'female' | null>(null),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      passwordConfirm: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordsMatch },
  );

  constructor() {
    this.form.controls.role.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((role) => this.onRoleChange(role));
  }

  private onRoleChange(role: RegisterRole | null): void {
    this.isTeacher.set(role === 'teacher');
    this.isStudent.set(role === 'student');

    const teacherType = this.form.controls.teacher_type;
    if (role === 'teacher') {
      teacherType.addValidators(Validators.required);
    } else {
      teacherType.removeValidators(Validators.required);
      teacherType.reset(null);
    }

    const birthDate = this.form.controls.birth_date;
    const gender = this.form.controls.gender;
    if (role === 'student') {
      birthDate.addValidators(Validators.required);
      gender.addValidators(Validators.required);
    } else {
      birthDate.removeValidators(Validators.required);
      birthDate.reset('');
      gender.removeValidators(Validators.required);
      gender.reset(null);
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorCode.set(null);

    const v = this.form.getRawValue();
    if (!v.role) return;
    const payload: RegisterPayload = {
      full_name: v.full_name,
      email: v.email,
      password: v.password,
      role: v.role,
      phone: v.phone,
    };
    if (v.role === 'teacher' && v.teacher_type) payload.teacher_type = v.teacher_type;
    if (v.role === 'student') {
      payload.birth_date = v.birth_date;
      if (v.gender) payload.gender = v.gender;
    }

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const code = (err.error as { errors?: Record<string, string[]> } | null)?.errors?.[
          'email'
        ]?.[0];
        this.errorCode.set(code === 'email_taken' || code === 'in_waiting_room' ? code : 'invalid');
      },
    });
  }
}
