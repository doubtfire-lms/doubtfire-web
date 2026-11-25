import {scalePoint} from 'd3-scale';
import {pointScaleOffset} from './chart-day-marker.directive';

describe('pointScaleOffset', () => {
  it.each([1, 2, 7, 40])('matches the chart point scale for %i points', (count) => {
    const domain = Array.from({length: count}, (_, index) => `${index}`);
    const scale = scalePoint().padding(0.1).range([0, 600]).domain(domain);

    domain.forEach((value, index) => {
      expect(pointScaleOffset(index, count, 600)).toBeCloseTo(scale(value), 6);
    });
  });
});
