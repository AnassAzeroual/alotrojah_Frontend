import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../../core/api/users.service';
import { CentersService } from '../../core/api/centers.service';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import {
  ListColumn,
  ListSort,
  ListTableColDef,
  ListTableComponent,
} from '../../shared/ui/list-table/list-table.component';
import { Role, User } from '../../core/api/api-models';

const ROLES: Role[] = ['admin', 'supervisor', 'teacher', 'student', 'board'];

/** Column config drives the shared list-table (headers, server sort, alignment). */
const COLUMNS: readonly ListColumn[] = [
  { key: 'full_name', headerKey: 'users.name', sortKey: 'full_name' },
  { key: 'role', headerKey: 'users.role', sortKey: 'role' },
  { key: 'teacher_type', headerKey: 'users.teacher_type', sortKey: false },
  { key: 'center_id', headerKey: 'users.center', sortKey: 'center_id' },
  { key: 'is_active', headerKey: 'users.is_active', sortKey: 'is_active' },
  { key: 'actions', headerKey: '', sortKey: false, align: 'end' },
];

@Component({
  selector: 'app-users-list-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, DropdownComponent, ListTableComponent, ListTableColDef],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-list.page.html',
  styleUrl: './users-list.page.scss',
})
export class UsersListPage {
  private readonly usersSvc = inject(UsersService);
  private readonly centersSvc = inject(CentersService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);

  readonly isAdmin = computed(() => this.auth.role() === 'admin');
  readonly currentId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly armingDeleteId = signal<number | null>(null);
  readonly busyId = signal<number | null>(null);
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
  readonly sort = signal<ListSort | null>(null);
  readonly unassignedOnly = signal(false);
  private readonly tick = signal(0);

  readonly cols = COLUMNS;

  private readonly query = resource({
    params: () => ({
      q: this.q(),
      r: this.role(),
      p: this.page(),
      u: this.unassignedOnly(),
      s: this.sort(),
      t: this.tick(),
    }),
    loader: ({ params }) => {
      const query: Record<string, string | number> = { page: params.p };
      if (params.q) query['q'] = params.q;
      if (params.r !== null) query['role'] = params.r;
      if (params.u) query['unassigned'] = 1;
      if (params.s?.dir) {
        query['sort'] = params.s.key;
        query['direction'] = params.s.dir;
      }
      return firstValueFrom(this.usersSvc.list(query));
    },
  });

  readonly rows = linkedSignal<User[] | undefined, User[]>({
    source: () => this.query.value()?.data,
    computation: (source, previous) => source ?? previous?.value ?? [],
  });
  readonly total = linkedSignal<number | undefined, number>({
    source: () => this.query.value()?.meta.total,
    computation: (source, previous) => source ?? previous?.value ?? 0,
  });

  /** Center names for the table (ids are meaningless to readers). Cached GET. */
  private readonly centers = resource({
    loader: () => firstValueFrom(this.centersSvc.list()),
  });

  protected centerName(id: number | null): string | null {
    if (id === null) return null;
    return this.centers.value()?.data.find((c) => c.id === id)?.name ?? null;
  }

  protected resetPage(): void {
    this.page.set(1);
    this.armingDeleteId.set(null);
    this.pendingReplace.set(null);
  }

  /** Debounced search from the list-table; the page owns the query value. */
  protected onSearch(value: string): void {
    this.q.set(value);
    this.resetPage();
  }

  /** Server sort from the list-table headers. */
  protected onSort(s: ListSort): void {
    this.sort.set(s);
    this.resetPage();
  }

  /** Paginator navigation: keeps the requested page and clears transient row/dialog state. */
  protected onPage(p: number): void {
    this.page.set(p);
    this.armingDeleteId.set(null);
    this.pendingReplace.set(null);
  }

  /** Cell templates receive the row as unknown (directive keeps cells data-agnostic). */
  protected userCell(u: unknown): User {
    return u as User;
  }

  canDelete(u: { id: number; role: Role }): boolean {
    return this.isAdmin() && u.id !== this.currentId() && u.role !== 'admin';
  }

  armDelete(id: number): void {
    this.armingDeleteId.set(id);
  }

  disarmDelete(): void {
    this.armingDeleteId.set(null);
  }

  confirmDelete(id: number): void {
    if (this.busyId() !== null) return;
    this.busyId.set(id);
    this.usersSvc.delete(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.armingDeleteId.set(null);
        this.refresh();
      },
      error: (err: unknown) => {
        this.busyId.set(null);
        const errors = (err as { error?: { errors?: Record<string, unknown> } })?.error?.errors;
        if ((err as { status?: number })?.status === 422 && errors?.['code'] === 'NEED_REPLACER') {
          this.armingDeleteId.set(null);
          const row = this.rows().find((u) => u.id === id);
          this.pendingReplace.set({
            id,
            name: (errors['teacher'] as { full_name?: string })?.full_name ?? row?.full_name ?? '',
            groups: (errors['groups'] as { id: number; name: string }[]) ?? [],
          });
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
