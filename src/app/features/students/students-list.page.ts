import { ChangeDetectionStrategy, Component, inject, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { GroupsService } from '../../core/api/groups.service';
import { ReferenceService } from '../../core/api/reference.service';
import { StudentsService } from '../../core/api/students.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator.component';

const STATUSES = ['active', 'paused', 'graduated', 'left'] as const;
const MODES = ['thumn', 'surah'] as const;

@Component({
  selector: 'app-students-list-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe, EmptyStateComponent, PaginatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './students-list.page.html',
  styleUrl: './students-list.page.scss',
})
export class StudentsListPage {
  private readonly studentsSvc = inject(StudentsService);
  private readonly groupsSvc = inject(GroupsService);
  private readonly ref = inject(ReferenceService);

  readonly groups = toSignal(this.groupsSvc.list().pipe(map((p) => p.data)), { initialValue: [] });
  readonly levels = toSignal(this.ref.levels(), { initialValue: [] });
  readonly statuses = STATUSES;
  readonly modes = MODES;

  readonly q = signal('');
  readonly groupId = signal<number | null>(null);
  readonly levelId = signal<number | null>(null);
  readonly status = signal<string | null>(null);
  readonly mode = signal<string | null>(null);
  readonly page = signal(1);

  private readonly query = resource({
    params: () => ({
      q: this.q(),
      g: this.groupId(),
      l: this.levelId(),
      s: this.status(),
      m: this.mode(),
      p: this.page(),
    }),
    loader: ({ params }) => {
      const query: Record<string, string | number> = { page: params.p };
      if (params.q) query['q'] = params.q;
      if (params.g !== null) query['group_id'] = params.g;
      if (params.l !== null) query['level_id'] = params.l;
      if (params.s !== null) query['status'] = params.s;
      if (params.m !== null) query['memorization_mode'] = params.m;
      return firstValueFrom(this.studentsSvc.list(query));
    },
  });

  readonly rows = () => this.query.value()?.data ?? [];
  readonly total = () => this.query.value()?.meta.total ?? 0;
  readonly loading = () => this.query.isLoading();

  protected num(v: string): number | null {
    return v === '' ? null : Number(v);
  }

  protected resetPage(): void {
    this.page.set(1);
  }
}
