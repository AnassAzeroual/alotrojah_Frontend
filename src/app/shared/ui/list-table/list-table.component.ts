import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  Directive,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { PaginatorComponent } from '../paginator/paginator.component';

export type ListSortDir = 'asc' | 'desc' | null;

/** Sort state. `dir: null` clears the sort (client + server modes). */
export interface ListSort {
  key: string;
  dir: ListSortDir;
}

export type ListColumnAlign = 'start' | 'end' | 'center';

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
}

/**
 * Per-column cell template, projected as content: `<ng-template listTableCol="key" let-row>`.
 * The context carries the row as `$implicit` (and as `row`); columns without a
 * template fall back to `render()` then plain `row[key]` text.
 */
@Directive({ selector: '[listTableCol]', standalone: true })
export class ListTableColDef<T> {
  readonly columnKey = input.required<string>({ alias: 'listTableCol' });
  readonly template = inject(TemplateRef<{ $implicit: T; row: T }>);
}

/**
 * Reusable list table: columns config, i18n headers, server/client sorting,
 * debounced search, pagination (the shared PaginatorComponent), loading /
 * empty states and a responsive stacked-card fallback at phone widths.
 *
 * The page keeps owning its data (`resource()`): the component only emits
 * `searchChange` / `pageChange` / `sortChange` and repaints the rows it is
 * given. `tableClass()` appends to the base `lt-table` class so existing
 * page/e2e selectors (e.g. `.users-table tbody tr`) keep working.
 */
@Component({
  selector: 'app-list-table',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    EmptyStateComponent,
    PaginatorComponent,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-table.component.html',
  styleUrl: './list-table.component.scss',
})
export class ListTableComponent<T> {
  readonly rows = input<readonly T[]>([]);
  readonly columns = input<readonly ListColumn[]>([]);
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
  /** Hide the pager when everything fits on one page (default on). */
  readonly hideSinglePagePager = input(true);

  /** True while the page fetches: renders a slim progress bar + `aria-busy`. */
  readonly loading = input(false);

  // Sorting.
  readonly sort = input<ListSort | null>(null);
  /** When true, rows() are sorted in memory by the active column key. */
  readonly clientSort = input(false);
  /** Optional value extractor for cells without a template (client sort uses it too). */
  readonly render = input<((row: T, col: ListColumn) => unknown) | null>(null);

  readonly searchChange = output<string>();
  readonly pageChange = output<number>();
  readonly sortChange = output<ListSort>();

  readonly searchControl = new FormControl('', { nonNullable: true });
  private lastEmitted = '';

  private readonly colTemplates = contentChildren(ListTableColDef<T>);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const val = this.searchValue();
      if (val !== this.searchControl.value) {
        this.searchControl.setValue(val, { emitEvent: false });
        this.lastEmitted = val.trim();
      }
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.searchDebounceMs()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((v) => this.emitSearch(v));
  }

  private emitSearch(val: string): void {
    const trimmed = val.trim();
    if (trimmed === this.lastEmitted) return;
    this.lastEmitted = trimmed;
    this.searchChange.emit(trimmed);
  }

  protected commitSearch(): void {
    this.emitSearch(this.searchControl.value);
  }

  protected clearSearch(): void {
    if (this.searchControl.value) {
      this.searchControl.setValue('');
      this.lastEmitted = '';
      this.searchChange.emit('');
    }
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

  /** Total page count from `total`/`perPage` (pager visibility gating). */
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.perPage())));

  /** Pager renders only when there is something to page. */
  readonly pagerVisible = computed(
    () =>
      this.showPagination() &&
      this.total() > 0 &&
      !(this.hideSinglePagePager() && this.pageCount() === 1),
  );

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
    this.searchControl.setValue(value);
  }
}
