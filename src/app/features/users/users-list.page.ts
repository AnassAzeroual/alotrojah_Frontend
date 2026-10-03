import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../../core/api/users.service';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator.component';
import { Role } from '../../core/api/api-models';

const ROLES: Role[] = ['admin', 'supervisor', 'teacher', 'student', 'board'];

@Component({
  selector: 'app-users-list-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, DropdownComponent, EmptyStateComponent, PaginatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-list.page.html',
  styleUrl: './users-list.page.scss',
})
export class UsersListPage {
  private readonly usersSvc = inject(UsersService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);

  readonly isAdmin = computed(() => this.auth.role() === 'admin');
  readonly currentId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly armingDeleteId = signal<number | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly deleteFailed = signal(false);
  readonly pendingReplace = signal<{
    id: number;
    name: string;
    groups: { id: number; name: string }[];
  } | null>(null);

  private allOption(key: string): DropdownOption {
    this.language.current();
    const t = (k: string): string => this.i18n.instant(k);
    return { value: '', label: `${t(key)}: ${t('list.all')}` };
  }

  readonly roleOptions = computed(() => [
    this.allOption('users.role_filter'),
    ...ROLES.map((r) => ({ value: r, labelKey: `role.${r}` })),
  ]);

  protected readonly num = dropdownNumber;
  protected readonly txt = dropdownText;

  readonly q = signal('');
  readonly role = signal<string | null>(null);
  readonly page = signal(1);
  readonly unassignedOnly = signal(false);
  private readonly tick = signal(0);

  private readonly query = resource({
    params: () => ({
      q: this.q(),
      r: this.role(),
      p: this.page(),
      u: this.unassignedOnly(),
      t: this.tick(),
    }),
    loader: ({ params }) => {
      const query: Record<string, string | number> = { page: params.p };
      if (params.q) query['q'] = params.q;
      if (params.r !== null) query['role'] = params.r;
      if (params.u) query['unassigned'] = 1;
      return firstValueFrom(this.usersSvc.list(query));
    },
  });

  readonly rows = () => this.query.value()?.data ?? [];
  readonly total = () => this.query.value()?.meta.total ?? 0;
  readonly loading = () => this.query.isLoading();

  protected resetPage(): void {
    this.page.set(1);
    this.armingDeleteId.set(null);
    this.pendingReplace.set(null);
  }

  canDelete(id: number): boolean {
    return this.isAdmin() && id !== this.currentId();
  }

  armDelete(id: number): void {
    this.armingDeleteId.set(id);
    this.deleteFailed.set(false);
  }

  disarmDelete(): void {
    this.armingDeleteId.set(null);
  }

  confirmDelete(id: number): void {
    if (this.busyId() !== null) return;
    this.busyId.set(id);
    this.deleteFailed.set(false);
    this.usersSvc.delete(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.armingDeleteId.set(null);
        this.refresh();
      },
      error: (err: { status?: number; error?: { errors?: Record<string, unknown> } }) => {
        this.busyId.set(null);
        const errors = err?.error?.errors;
        if (err?.status === 422 && errors?.['code'] === 'NEED_REPLACER') {
          this.armingDeleteId.set(null);
          const row = this.rows().find((u) => u.id === id);
          this.pendingReplace.set({
            id,
            name: (errors['teacher'] as { full_name?: string })?.full_name ?? row?.full_name ?? '',
            groups: (errors['groups'] as { id: number; name: string }[]) ?? [],
          });
        } else {
          this.deleteFailed.set(true);
        }
      },
    });
  }

  goReplace(): void {
    const p = this.pendingReplace();
    if (!p) return;
    this.pendingReplace.set(null);
    void this.router.navigate(['/users', p.id, 'replace']);
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

  protected roleClass(role: string): string {
    return role;
  }
}
