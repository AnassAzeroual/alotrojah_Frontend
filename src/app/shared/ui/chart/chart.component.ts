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

/** Thin Chart.js wrapper: create on view init, update on input change, destroy on teardown. */
@Component({
  selector: 'app-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #chartCanvas></canvas>`,
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  readonly type = input.required<ChartType>();
  readonly data = input.required<ChartData>();
  readonly options = input<ChartOptions | undefined>(undefined);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.chart = new Chart(this.canvas().nativeElement, {
      type: this.type(),
      data: this.data(),
      options: this.rtlOptions(),
    });
  }

  ngOnChanges(): void {
    if (!this.chart) return;
    this.chart.data = this.data();
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
      ...base,
      plugins: {
        ...(base.plugins ?? {}),
        legend: { rtl: true, textDirection: 'rtl', ...(base.plugins?.['legend'] ?? {}) },
        tooltip: { rtl: true, textDirection: 'rtl', ...(base.plugins?.['tooltip'] ?? {}) },
      },
    };
  }
}
