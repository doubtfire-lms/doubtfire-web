import {scalePoint} from 'd3-scale';
import {pointScaleOffset, steppedPointIndex} from './chart-day-marker.directive';

describe('pointScaleOffset', () => {
  it.each([1, 2, 7, 40])('matches the chart point scale for %i points', (count) => {
    const domain = Array.from({length: count}, (_, index) => `${index}`);
    const scale = scalePoint().padding(0.1).range([0, 600]).domain(domain);

    domain.forEach((value, index) => {
      expect(pointScaleOffset(index, count, 600)).toBeCloseTo(scale(value), 6);
    });
  });
});

describe('steppedPointIndex', () => {
  const key = (name: string) => new KeyboardEvent('keydown', {key: name, cancelable: true});

  it('steps from the latest point when nothing is marked', () => {
    expect(steppedPointIndex(key('ArrowLeft'), null, 5)).toBe(3);
  });

  it('stays within the first and last points', () => {
    expect(steppedPointIndex(key('ArrowLeft'), 0, 5)).toBe(0);
    expect(steppedPointIndex(key('ArrowRight'), 4, 5)).toBe(4);
  });

  it('ignores other keys without stopping them', () => {
    const event = key('Tab');
    expect(steppedPointIndex(event, 2, 5)).toBeNull();
    expect(event.defaultPrevented).toBe(false);
  });
});
