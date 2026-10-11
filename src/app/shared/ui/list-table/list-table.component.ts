import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  DestroyRef,
  inject,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { PaginatorComponent } from '../paginator/paginator.component';

export type ListSortDir = 'asc' | 'desc' | null;

/** Sort state. `dir: null` clears the sort (client + server modes). */
export interface ListSort {
  key: string;
  dir: ListSortDir;
}

export type ListColumnAlign = 'start' | 'end' | 'center';
export type ListColumnPriority = 'always' | 'low';

/**
 * Column definition. `key` doubles as the client-sort property path and the
 * mobile stacked-card label source; `headerKey` is the i18n key for the `<th>`
 * (empty string renders a bare header cell — e.g. an actions column).
 */
export interface ListColumn {
  key: string;
  headerKey: string;
  /** Server sort param. `false` disables sorting; omitted means `key`. */
  sortKey?: string | false;
  /** Dates/times/numbers: `dir=ltr` + end-aligned (the app's `ltr-num` pattern). */
  numeric?: boolean;
  align?: ListColumnAlign;
  /** `'low'` columns are hidden under the mobile breakpoint. */
  priority?: ListColumnPriority;
}

/**
 * Per-column cell template, projected as content: `<ng-template listTableCol="key" let-row>`.
 * The context carries the row as `$implicit` (and as `row`); columns without a
 * template fall back to `render()` then plain `row[key]` text.
 */
@Directive({ selector: '[listTableCol]', standalone: true })
export class ListTableColDef<T> {
  readonly columnKey = input.required<string>({ alias: 'listTableCol' });
  constructor(readonly template: TemplateRef<{ $implicit: T; row: T }>) {}
}

/**
 * Reusable list table: columns config, i18n headers, server/client sorting,
 * debounced search, pagination (the shared PaginatorComponent), loading /
 * empty states and a responsive stacked-card fallback under 640px.
 *
 * The page keeps owning its data (`resource()`): the component only emits
 * `searchChange` / `pageChange` / `sortChange` and repaints the rows it is
 * given. `tableClass()` appends to the base `lt-table` class so existing
 * page/e2e selectors (e.g. `.users-table tbody tr`) keep working.
 */
@Component({
  selector: 'app-list-table',
  standalone: true,
  imports: [TranslatePipe, EmptyStateComponent, PaginatorComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-table.component.html',
  styleUrl: './list-table.component.scss',
})
export class ListTableComponent<T> {
  readonly rows = input<readonly T[]>([]);
  readonly columns = input<readonly ListColumn[]>([]);
  readonly loading = input(false);
  readonly trackKey = input<string>('id');
  /** Extra class appended to the `<table>` (page/e2e hooks like `.users-table`). */
  readonly tableClass = input('');

  /** i18n key for the empty state line. */
  readonly emptyTitleKey = input('');

  // Search (debounced, server or client mode; the page owns the query value).
  readonly searchVisible = input(true);
  readonly searchValue = input('');
  readonly searchPlaceholderKey = input('list.search');
  readonly searchTestId = input('');
  readonly searchDebounceMs = input(350);

  // Pagination (shared PaginatorComponent; the page owns `page`/`total`).
  readonly page = input(1);
  readonly total = input(0);
  readonly perPage = input(20);
  readonly showPagination = input(true);

  // Sorting.
  readonly sort = input<ListSort | null>(null);
  /** When true, rows() are sorted in memory by the active column key. */
  readonly clientSort = input(false);
  /** Optional value extractor for cells without a template (client sort uses it too). */
  readonly render = input<((row: T, col: ListColumn) => unknown) | null>(null);

  readonly searchChange = output<string>();
  readonly pageChange = output<number>();
  readonly sortChange = output<ListSort>();

  private readonly colTemplates = contentChildren(ListTableColDef<T>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pending = new Subject<string>();

  constructor() {
    this.pending
      .pipe(
        debounceTime(this.searchDebounceMs()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((v) => this.searchChange.emit(v));
  }

  /** Client-mode ordering; server mode just passes rows() through. */
  readonly sortedRows = computed<readonly T[]>(() => {
    const rows = this.rows();
    const s = this.sort();
    if (!this.clientSort() || !s?.dir || rows.length < 2) return rows;
    const dir = s.dir === 'asc' ? 1 : -1;
    const value = (r: T): unknown => {
      const f = this.render();
      const col = this.columns().find((c) => c.key === s.key);
      if (f && col) return f(r, col);
      return (r as Record<string, unknown>)[s.key];
    };
    return [...rows].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va ?? '').localeCompare(String(vb ?? ''), undefined, { numeric: true }) * dir;
    });
  });

  protected sortKeyOf(col: ListColumn): string | null {
    return col.sortKey === false ? null : (col.sortKey ?? col.key);
  }

  protected isSortable(col: ListColumn): boolean {
    return this.sortKeyOf(col) !== null;
  }

  /** ¬asc → desc → clear, then repeats. */
  protected toggleSort(col: ListColumn): void {
    const key = this.sortKeyOf(col);
    if (!key) return;
    const cur = this.sort();
    const next: ListSort =
      !cur || cur.key !== key
        ? { key, dir: 'asc' }
        : cur.dir === 'asc'
          ? { key, dir: 'desc' }
          : { key, dir: null };
    this.sortChange.emit(next);
  }

  protected sortActive(col: ListColumn): boolean {
    const s = this.sort();
    return !!s?.dir && s.key === this.sortKeyOf(col);
  }

  protected sortDir(col: ListColumn): 'asc' | 'desc' | null {
    const s = this.sort();
    return s && s.key === this.sortKeyOf(col) ? s.dir : null;
  }

  protected ariaSort(col: ListColumn): 'ascending' | 'descending' | null {
    const dir = this.sortDir(col);
    return dir === 'desc' ? 'descending' : dir === 'asc' ? 'ascending' : null;
  }

  protected templateFor(key: string): TemplateRef<{ $implicit: T; row: T }> | null {
    return this.colTemplates().find((d) => d.columnKey() === key)?.template ?? null;
  }

  protected cellText(row: T, col: ListColumn): unknown {
    const f = this.render();
    return f ? f(row, col) : (row as Record<string, unknown>)[col.key];
  }

  protected trk(row: T): unknown {
    return (row as Record<string, unknown>)[this.trackKey()];
  }

  protected onSearch(value: string): void {
    this.pending.next(value);
  }
}
