import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  provideTranslateLoader,
  provideTranslateService,
  TranslateNoOpLoader,
} from '@ngx-translate/core';
import { ListColumn, ListSort, ListTableColDef, ListTableComponent } from './list-table.component';

interface Row {
  id: number;
  name: string;
  score: number;
}

const TWO_COLS: ListColumn[] = [
  { key: 'name', headerKey: 'users.name', sortKey: 'name' },
  { key: 'score', headerKey: 'users.score', sortKey: 'score', numeric: true, priority: 'low' },
];

const ROWS: Row[] = [
  { id: 3, name: 'Carol', score: 90 },
  { id: 1, name: 'Alice', score: 70 },
  { id: 2, name: 'Bob', score: 80 },
];

/** Content-projection host: the only thing that needs a wrapper (cells stay generic). */
@Component({
  standalone: true,
  imports: [ListTableComponent, ListTableColDef],
  template: `
    <app-list-table [rows]="rows" [columns]="columns">
      <ng-template listTableCol="name" let-r>{{ nameTag(r) }}</ng-template>
    </app-list-table>
  `,
})
class Host {
  rows: Row[] = ROWS;
  columns: ListColumn[] = TWO_COLS;
  nameTag(r: unknown): string {
    return `T:${(r as Row).name}`;
  }
}

describe('ListTableComponent', () => {
  let fixture: ComponentFixture<ListTableComponent<Row>>;
  let cmp: ListTableComponent<Row>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideTranslateService({
          loader: provideTranslateLoader(() => new TranslateNoOpLoader()),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListTableComponent<Row>);
    cmp = fixture.componentInstance;
    fixture.componentRef.setInput('rows', ROWS);
    fixture.componentRef.setInput('columns', TWO_COLS);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const nameTds = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('tbody td')).filter(
      (td) => (td as HTMLElement).getAttribute('data-label') === 'users.name',
    ) as HTMLElement[];

  it('renders translated headers and plain-text cells without templates', () => {
    fixture.componentRef.setInput('columns', [
      { key: 'score', headerKey: 'users.score', sortKey: false },
    ]);
    fixture.detectChanges();
    const ths = fixture.nativeElement.querySelectorAll('thead th');
    expect(ths.length).toBe(1);
    expect(ths[0].textContent).toContain('users.score');
    const cells = fixture.nativeElement.querySelectorAll('tbody td');
    expect(cells[0].textContent?.trim()).toBe('90');
    expect(cells[2].textContent?.trim()).toBe('80');
  });

  it('renders projected cell templates with the row as $implicit', () => {
    const hostFixture = TestBed.createComponent(Host);
    hostFixture.detectChanges();
    const tds = Array.from(hostFixture.nativeElement.querySelectorAll('tbody td')).filter(
      (td) => (td as HTMLElement).getAttribute('data-label') === 'users.name',
    ) as HTMLElement[];
    expect(tds.map((td) => td.textContent)).toEqual(['T:Carol', 'T:Alice', 'T:Bob']);
  });

  it('shows empty state when empty, table otherwise, keeping search input mounted', () => {
    fixture.componentRef.setInput('rows', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect(fixture.nativeElement.querySelector('input[type="search"]')).toBeTruthy();

    fixture.componentRef.setInput('rows', ROWS);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lt-table')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[type="search"]')).toBeTruthy();
  });

  it('cycles sort asc → desc → cleared, emitting each state', () => {
    const log: ListSort[] = [];
    cmp.sortChange.subscribe((s) => log.push(s));
    const btn = fixture.nativeElement.querySelector('thead button') as HTMLButtonElement;

    btn.click();
    expect(log).toEqual([{ key: 'name', dir: 'asc' }]);
    fixture.componentRef.setInput('sort', log.at(-1));
    fixture.detectChanges();

    btn.click();
    expect(log.at(-1)).toEqual({ key: 'name', dir: 'desc' });
    fixture.componentRef.setInput('sort', log.at(-1));
    fixture.detectChanges();

    btn.click();
    expect(log.at(-1)).toEqual({ key: 'name', dir: null });
  });

  it('marks the active sort header with aria-sort', () => {
    fixture.componentRef.setInput('sort', { key: 'name', dir: 'asc' });
    fixture.detectChanges();
    const ths = fixture.nativeElement.querySelectorAll('thead th');
    expect(ths[0].getAttribute('aria-sort')).toBe('ascending');
    expect(ths[1].getAttribute('aria-sort')).toBeNull();
  });

  it('client-sorts rows in memory by the active column', () => {
    fixture.componentRef.setInput('clientSort', true);
    fixture.componentRef.setInput('sort', { key: 'name', dir: 'asc' });
    fixture.detectChanges();
    const readOrder = (): string[] => nameTds().map((td) => td.textContent.trim());
    expect(readOrder()).toEqual(['Alice', 'Bob', 'Carol']);

    fixture.componentRef.setInput('sort', { key: 'name', dir: 'desc' });
    fixture.detectChanges();
    expect(readOrder()).toEqual(['Carol', 'Bob', 'Alice']);
  });

  it('marks numeric columns ltr + end-aligned and low-priority ones hidden on mobile', () => {
    const scoreTh = fixture.nativeElement.querySelectorAll('thead th')[1];
    const scoreTd = fixture.nativeElement.querySelectorAll('tbody tr')[0].querySelectorAll('td')[1];
    expect(scoreTh.classList.contains('lt-end')).toBe(true);
    expect(scoreTh.classList.contains('lt-hide-sm')).toBe(true);
    expect(scoreTd.getAttribute('dir')).toBe('ltr');
    expect(scoreTd.classList.contains('lt-end')).toBe(true);
  });

  it('appends tableClass to the table element for page/e2e hooks', () => {
    fixture.componentRef.setInput('tableClass', 'users-table');
    fixture.detectChanges();
    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    expect(table.classList.contains('lt-table')).toBe(true);
    expect(table.classList.contains('users-table')).toBe(true);
  });

  it('debounces search input and emits the final value', () => {
    vi.useFakeTimers();
    const log: string[] = [];
    cmp.searchChange.subscribe((v) => log.push(v));
    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'ali';
    input.dispatchEvent(new Event('input'));
    expect(log).toEqual([]);
    vi.advanceTimersByTime(349);
    expect(log).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(log).toEqual(['ali']);
  });

  it('skips consecutive duplicate search values', () => {
    vi.useFakeTimers();
    const log: string[] = [];
    cmp.searchChange.subscribe((v) => log.push(v));
    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'ali';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(400);
    input.value = 'ali';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(400);
    expect(log).toEqual(['ali']);
  });

  it('immediately emits search on Enter key press without waiting for debounce', () => {
    vi.useFakeTimers();
    const log: string[] = [];
    cmp.searchChange.subscribe((v) => log.push(v));
    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'immediate';
    input.dispatchEvent(new Event('input'));
    expect(log).toEqual([]);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(log).toEqual(['immediate']);

    vi.advanceTimersByTime(400);
    expect(log).toEqual(['immediate']);
  });

  it('clears search and emits empty string on Escape key', () => {
    const log: string[] = [];
    cmp.searchChange.subscribe((v) => log.push(v));
    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    cmp.searchControl.setValue('active query');
    fixture.detectChanges();
    expect(input.value).toBe('active query');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(input.value).toBe('');
    expect(log).toEqual(['']);
  });

  it('forwards paginator page changes', () => {
    const log: number[] = [];
    cmp.pageChange.subscribe((p) => log.push(p));
    fixture.componentRef.setInput('total', 100);
    fixture.componentRef.setInput('page', 2);
    fixture.detectChanges();
    const next = fixture.nativeElement.querySelectorAll('.pager button')[1] as HTMLButtonElement;
    next.click();
    expect(log).toEqual([3]);
  });

  it('applies lt-center to header and cells of center-aligned columns', () => {
    fixture.componentRef.setInput('columns', [
      { key: 'name', headerKey: 'users.name', sortKey: false, align: 'center' },
    ]);
    fixture.detectChanges();
    const th = fixture.nativeElement.querySelector('thead th') as HTMLElement;
    const td = fixture.nativeElement.querySelector('tbody td') as HTMLElement;
    expect(th.classList.contains('lt-center')).toBe(true);
    expect(td.classList.contains('lt-center')).toBe(true);
  });

  it('shows a no-results message with a clear-search action when a query returns nothing', () => {
    const log: string[] = [];
    cmp.searchChange.subscribe((v) => log.push(v));
    cmp.searchControl.setValue('zzz', { emitEvent: false });
    fixture.componentRef.setInput('rows', []);
    fixture.detectChanges();

    const clear = fixture.nativeElement.querySelector(
      '[data-testid="list-clear-search"]',
    ) as HTMLButtonElement;
    expect(clear).toBeTruthy();
    clear.click();
    expect(log).toEqual(['']);
    expect(cmp.searchControl.value).toBe('');
  });

  it('keeps the pager on an empty page when total > 0 (out-of-range recovery)', () => {
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('total', 40);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-paginator')).toBeTruthy();
  });

  it('hides the pager for empty or single-page sets by default', () => {
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('total', 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-paginator')).toBeNull();

    fixture.componentRef.setInput('rows', ROWS);
    fixture.componentRef.setInput('total', 3);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-paginator')).toBeNull();
  });

  it('shows the pager for single-page sets when hideSinglePagePager is off', () => {
    fixture.componentRef.setInput('rows', ROWS);
    fixture.componentRef.setInput('total', 3);
    fixture.componentRef.setInput('hideSinglePagePager', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-paginator')).toBeTruthy();
  });

  it('renders a progress status while loading and aria-busy on the table', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lt-progress')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('table').getAttribute('aria-busy')).toBe('true');

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lt-progress')).toBeNull();
    expect(fixture.nativeElement.querySelector('table').getAttribute('aria-busy')).toBeNull();
  });

  it('hides the empty state while loading so first paint does not flash "no data"', () => {
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
    expect(fixture.nativeElement.querySelector('.lt-progress')).toBeTruthy();

    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.lt-progress')).toBeNull();
  });

  it('labels pager controls accessibly and translates the total', () => {
    fixture.componentRef.setInput('total', 100);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('.pager button') as HTMLElement[];
    expect(buttons[0].getAttribute('aria-label')).toBe('list.pager_prev');
    expect(buttons[1].getAttribute('aria-label')).toBe('list.pager_next');
    expect(fixture.nativeElement.querySelector('.pager small').textContent).toContain('list.total');
  });
});
