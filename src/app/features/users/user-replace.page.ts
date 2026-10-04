import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { GroupsService } from '../../core/api/groups.service';
import { UsersService } from '../../core/api/users.service';
import { apiErrorKey } from '../../core/api/api-errors';
import { LanguageService } from '../../core/i18n/language.service';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
} from '../../shared/ui/dropdown/dropdown.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

/**
 * Pick a replacer for a group-owning teacher, then delete the teacher.
 * Candidates: active teachers, same center, same type (or 'both' — strict),
 * free (no active group). The server re-validates everything.
 */
@Component({
  selector: 'app-user-replace-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, DropdownComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-replace.page.html',
  styleUrl: './user-replace.page.scss',
})
export class UserReplacePage {
  readonly id = input.required<number, string>({ transform: (v: string) => Number(v) });

  private readonly usersSvc = inject(UsersService);
  private readonly groupsSvc = inject(GroupsService);
  private readonly language = inject(LanguageService);
  private readonly i18n = inject(TranslateService);
  private readonly router = inject(Router);

  protected readonly num = dropdownNumber;
  readonly replacer = signal<number | null>(null);
  readonly saving = signal(false);
  readonly errorKey = signal<string | null>(null);

  private readonly teacherRes = resource({
    params: () => ({ id: this.id() }),
    loader: ({ params }) => firstValueFrom(this.usersSvc.get(params.id)),
  });

  private readonly teachersRes = resource({
    params: () => ({ center: this.centerId() }),
    loader: ({ params }) => {
      const query: Record<string, string | number> = { role: 'teacher' };
      if (params.center !== null) query['center_id'] = params.center;
      return this.usersSvc.listAll(query);
    },
  });

  private readonly groupsRes = resource({
    params: () => ({ center: this.centerId() }),
    loader: ({ params }) => {
      const query: Record<string, string | number> = {};
      if (params.center !== null) query['center_id'] = params.center;
      return this.groupsSvc.listAll(query);
    },
  });

  readonly teacher = () => this.teacherRes.value() ?? null;
  readonly centerId = computed(() => this.teacher()?.center_id ?? null);
  readonly loading = () =>
    this.teacherRes.isLoading() || this.teachersRes.isLoading() || this.groupsRes.isLoading();

  readonly blockingGroups = computed(() =>
    (this.groupsRes.value() ?? []).filter((g) => g.teacher?.id === this.id() && g.is_active),
  );

  readonly candidates = computed(() => {
    this.language.current();
    const t = this.teacher();
    if (!t) return [];
    const groups = this.groupsRes.value() ?? [];
    const center = t.center_id ?? 0;
    return (this.teachersRes.value() ?? []).filter(
      (c) =>
        c.id !== this.id() &&
        c.is_active &&
        c.role === 'teacher' &&
        (c.center_id ?? 0) === center &&
        (c.teacher_type === t.teacher_type || c.teacher_type === 'both') &&
        !groups.some((g) => g.is_active && g.teacher?.id === c.id),
    );
  });

  readonly candidateOptions = computed<DropdownOption[]>(() => {
    this.language.current();
    return [
      { value: '', labelKey: 'users.pick_replacer' },
      ...this.candidates().map((c) => ({
        value: c.id,
        label: `${c.full_name} · ${this.i18n.instant('teacher_type.' + c.teacher_type)}`,
      })),
    ];
  });

  submit(): void {
    const replacerId = this.replacer();
    if (replacerId === null || this.saving()) return;
    this.saving.set(true);
    this.errorKey.set(null);
    this.usersSvc.replace(this.id(), replacerId).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/users']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.errorKey.set(apiErrorKey(err));
      },
    });
  }
}
