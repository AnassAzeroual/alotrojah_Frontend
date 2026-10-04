import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { GroupsService } from '../../core/api/groups.service';
import { ReferenceService } from '../../core/api/reference.service';
import { StudentsService } from '../../core/api/students.service';
import { LanguageService } from '../../core/i18n/language.service';
import {
  DropdownComponent,
  DropdownOption,
  dropdownNumber,
  dropdownText,
} from '../../shared/ui/dropdown/dropdown.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator.component';

const STATUSES = ['active', 'paused', 'graduated', 'left'] as const;
const MODES = ['thumn', 'surah'] as const;

@Component({
  selector: 'app-students-list-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, DropdownComponent, EmptyStateComponent, PaginatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './students-list.page.html',
  styleUrl: './students-list.page.scss',
})
export class StudentsListPage {
  private readonly studentsSvc = inject(StudentsService);
  private readonly groupsSvc = inject(GroupsService);
  private readonly ref = inject(ReferenceService);
  private readonly i18n = inject(TranslateService);
  private readonly language = inject(LanguageService);

  private allOption(key: string): DropdownOption {
    this.language.current();
    const t = (k: string): string => this.i18n.instant(k);
    return { value: '', label: `${t(key)}: ${t('list.all')}` };
  }

  readonly groupOptions = computed(() => [
    this.allOption('list.group'),
    ...this.groups().map((g) => ({ value: String(g.id), label: g.name })),
  ]);
  readonly levelOptions = computed(() => [
    this.allOption('list.level'),
    ...this.levels().map((l) => ({ value: String(l.id), label: l.name_ar })),
  ]);
  readonly statusOptions = computed(() => [
    this.allOption('list.status'),
    ...STATUSES.map((s) => ({ value: s, labelKey: `studentStatus.${s}` })),
  ]);
  readonly modeOptions = computed(() => [
    this.allOption('list.mode'),
    ...MODES.map((m) => ({ value: m, labelKey: `mode.${m}` })),
  ]);

  readonly groups = toSignal(this.groupsSvc.list().pipe(map((p) => p.data)), { initialValue: [] });
  readonly levels = toSignal(this.ref.levels(), { initialValue: [] });

  protected readonly num = dropdownNumber;
  protected readonly txt = dropdownText;

  readonly q = signal('');
  readonly groupId = signal<number | null>(null);
  readonly levelId = signal<number | null>(null);
  readonly status = signal<string | null>(null);
  readonly mode = signal<string | null>(null);
  readonly unassignedOnly = signal(false);
  readonly page = signal(1);

  private readonly query = resource({
    params: () => ({
      q: this.q(),
      g: this.groupId(),
      l: this.levelId(),
      s: this.status(),
      m: this.mode(),
      u: this.unassignedOnly(),
      p: this.page(),
    }),
    loader: ({ params }) => {
      const query: Record<string, string | number> = { page: params.p };
      if (params.q) query['q'] = params.q;
      if (params.g !== null) query['group_id'] = params.g;
      if (params.l !== null) query['level_id'] = params.l;
      if (params.s !== null) query['status'] = params.s;
      if (params.m !== null) query['memorization_mode'] = params.m;
      if (params.u) query['unassigned'] = 1;
      return firstValueFrom(this.studentsSvc.list(query));
    },
  });

  readonly rows = () => this.query.value()?.data ?? [];
  readonly total = () => this.query.value()?.meta.total ?? 0;
  readonly loading = () => this.query.isLoading();

  protected resetPage(): void {
    this.page.set(1);
  }
}
