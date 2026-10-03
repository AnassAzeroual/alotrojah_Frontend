import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../../core/api/users.service';
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
  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);

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

  private readonly query = resource({
    params: () => ({
      q: this.q(),
      r: this.role(),
      p: this.page(),
    }),
    loader: ({ params }) => {
      const query: Record<string, string | number> = { page: params.p };
      if (params.q) query['q'] = params.q;
      if (params.r !== null) query['role'] = params.r;
      return firstValueFrom(this.usersSvc.list(query));
    },
  });

  readonly rows = () => this.query.value()?.data ?? [];
  readonly total = () => this.query.value()?.meta.total ?? 0;
  readonly loading = () => this.query.isLoading();

  protected resetPage(): void {
    this.page.set(1);
  }

  protected roleClass(role: string): string {
    return role;
  }
}
