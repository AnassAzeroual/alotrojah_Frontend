import { Chart } from 'chart.js';
import './chart.component';

// Registration is hand-picked instead of `registerables`; a dropped item would only
// fail at runtime, so this spec turns it into a test failure.
describe('chart registration', () => {
  it('covers controllers, elements, scales and plugins for line/bar/doughnut', () => {
    for (const type of ['line', 'bar', 'doughnut']) {
      expect(Chart.registry.getController(type)).toBeDefined();
    }
    for (const element of ['line', 'point', 'bar', 'arc']) {
      expect(Chart.registry.getElement(element)).toBeDefined();
    }
    for (const scale of ['category', 'linear']) {
      expect(Chart.registry.getScale(scale)).toBeDefined();
    }
    for (const plugin of ['legend', 'tooltip', 'filler']) {
      expect(Chart.registry.getPlugin(plugin)).toBeDefined();
    }
  });
});
