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

const FONT = "'Readex Pro','Tajawal','Cairo','Segoe UI',sans-serif";

/** Thin Chart.js wrapper: create on view init, update on input change, destroy on teardown. */
@Component({
  selector: 'app-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="chart-box">
    <canvas #chartCanvas role="img" [attr.aria-label]="label()"></canvas>
  </div>`,
  styles: [
    '.chart-box{position:relative;height:260px} :host{display:block} canvas{max-height:260px}',
  ],
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

  private isDark(): boolean {
    return document.documentElement.dataset['theme'] === 'dark';
  }

  private rtlOptions(): ChartOptions {
    const base = this.options() ?? {};
    const dark = this.isDark();
    const tickColor = dark ? '#94b3ad' : '#64748b';
    return {
      animation: { duration: 800, easing: 'easeOutQuart' },
      responsive: true,
      maintainAspectRatio: false,
      ...(this.type() === 'doughnut' && (base as Record<string, unknown>)['cutout'] === undefined
        ? { cutout: '72%' }
        : {}),
      ...base,
      plugins: {
        ...(base.plugins ?? {}),
        legend: {
          rtl: true,
          textDirection: 'rtl',
          position: 'bottom',
          labels: { font: { family: FONT }, color: tickColor, usePointStyle: true, padding: 16 },
          ...(base.plugins?.['legend'] ?? {}),
        },
        tooltip: {
          rtl: true,
          textDirection: 'rtl',
          backgroundColor: dark ? '#12211d' : '#0b2e25',
          borderColor: 'rgba(0,184,169,.4)',
          borderWidth: 1,
          titleFont: { family: FONT },
          bodyFont: { family: FONT },
          cornerRadius: 12,
          padding: 12,
          ...(base.plugins?.['tooltip'] ?? {}),
        },
      },
      scales: this.type() === 'doughnut' ? undefined : this.themedScales(base, tickColor, dark),
    };
  }

  private themedData(): ChartData {
    const palette = ['#00b8a9', '#8b5cf6', '#0e9f6e', '#06b6d4', '#f59e0b', '#64748b'];
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

  private themedScales(
    base: ChartOptions,
    tickColor = '#64748b',
    dark = false,
  ): ChartOptions['scales'] {
    const tick = { font: { family: FONT }, color: tickColor };
    const grid = { color: dark ? 'rgba(255,255,255,.06)' : 'rgba(0,184,169,.1)' };
    const defaults: Record<string, Record<string, unknown>> = {
      x: { grid: { display: false }, ticks: { ...tick } },
      y: { grid, ticks: { ...tick }, border: { display: false } },
    };
    const scales = { ...defaults, ...((base.scales ?? {}) as object) } as Record<
      string,
      Record<string, unknown>
    >;
    for (const key of Object.keys(scales)) {
      scales[key]['ticks'] = { ...tick, ...((scales[key]['ticks'] as object) ?? {}) };
      if (key === 'y')
        scales[key]['grid'] = { ...grid, ...((scales[key]['grid'] as object) ?? {}) };
    }
    return scales as ChartOptions['scales'];
  }
}
