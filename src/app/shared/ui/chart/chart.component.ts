import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  OnChanges,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { Chart, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

const FONT = "'Cairo','Segoe UI',Tahoma,sans-serif";

/** Thin Chart.js wrapper: create on view init, update on input change, destroy on teardown. */
@Component({
  selector: 'app-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #chartCanvas role="img" [attr.aria-label]="label()"></canvas>`,
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly type = input.required<ChartType>();
  readonly data = input.required<ChartData>();
  readonly options = input<ChartOptions | undefined>(undefined);
  readonly label = input('chart');

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.chart = new Chart(this.canvas().nativeElement, {
      type: this.type(),
      data: this.themedData(),
      options: this.rtlOptions(),
    });
  }

  ngOnChanges(): void {
    if (!this.chart) return;
    this.chart.data = this.themedData();
    this.chart.options = this.rtlOptions();
    this.chart.update();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  private rtlOptions(): ChartOptions {
    const base = this.options() ?? {};
    return {
      animation: { duration: 700, easing: 'easeOutQuart' },
      ...(this.type() === 'doughnut' && (base as Record<string, unknown>)['cutout'] === undefined
        ? { cutout: '68%' }
        : {}),
      ...base,
      plugins: {
        ...(base.plugins ?? {}),
        legend: {
          rtl: true,
          textDirection: 'rtl',
          labels: { font: { family: FONT }, color: '#1c2420', usePointStyle: true },
          ...(base.plugins?.['legend'] ?? {}),
        },
        tooltip: {
          rtl: true,
          textDirection: 'rtl',
          backgroundColor: '#063325',
          titleFont: { family: FONT },
          bodyFont: { family: FONT },
          cornerRadius: 12,
          ...(base.plugins?.['tooltip'] ?? {}),
        },
      },
      scales: this.themedScales(base),
    };
  }

  private themedData(): ChartData {
    const palette = ['#0e7c5b', '#c9a227', '#2f9e73', '#2471a3', '#6fbf97', '#d48806'];
    const src = this.data();
    return {
      ...src,
      datasets: src.datasets.map((ds, i) => {
        const d = { ...(ds as unknown as Record<string, unknown>) };
        if (d['backgroundColor'] === undefined) {
          d['backgroundColor'] = this.type() === 'doughnut' ? palette : palette[i % palette.length];
        }
        if (d['borderColor'] === undefined) d['borderColor'] = '#ffffff';
        if (d['borderWidth'] === undefined) d['borderWidth'] = this.type() === 'doughnut' ? 3 : 0;
        if (this.type() === 'bar' && d['borderRadius'] === undefined) d['borderRadius'] = 8;
        return d as unknown as (typeof src.datasets)[number];
      }),
    };
  }

  private themedScales(base: ChartOptions): ChartOptions['scales'] {
    const tick = { font: { family: FONT }, color: '#6b7671' };
    const grid = { color: 'rgba(14,124,91,.08)' };
    const scales = { ...(base.scales ?? {}) } as Record<string, Record<string, unknown>>;
    for (const key of Object.keys(scales)) {
      scales[key]['ticks'] = { ...tick, ...((scales[key]['ticks'] as object) ?? {}) };
      scales[key]['grid'] = { ...grid, ...((scales[key]['grid'] as object) ?? {}) };
    }
    return scales as ChartOptions['scales'];
  }
}
