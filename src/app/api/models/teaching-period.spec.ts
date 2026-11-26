import {describe, expect, it} from 'vitest';
import {TeachingPeriod, TeachingPeriodBreak} from './teaching-period';

describe('TeachingPeriod', () => {
  const teachingPeriod = (): TeachingPeriod => {
    const period = new TeachingPeriod();
    period.startDate = new Date(2026, 6, 27); // Monday

    const teachingBreak = new TeachingPeriodBreak();
    teachingBreak.id = 1;
    teachingBreak.startDate = new Date(2026, 8, 14); // Monday of week 8
    teachingBreak.numberOfDays = 14;
    period.breaksCache.add(teachingBreak);

    return period;
  };

  it('skips week pausing breaks when finding the date for a week and day', () => {
    const period = teachingPeriod();

    expect(period.dateForWeekAndDay(1, 1)).toEqual(new Date(2026, 6, 27));
    expect(period.dateForWeekAndDay(1, 0)).toEqual(new Date(2026, 7, 2));
    expect(period.dateForWeekAndDay(7, 5)).toEqual(new Date(2026, 8, 11));
    expect(period.dateForWeekAndDay(8, 1)).toEqual(new Date(2026, 8, 28));
  });

  it('round trips every teaching day through week number and day', () => {
    const period = teachingPeriod();

    for (let offset = 0; offset < 16 * 7; offset++) {
      const date = new Date(2026, 6, 27 + offset);
      if (period.breakAt(date)) {
        continue;
      }

      expect(period.dateForWeekAndDay(period.weekNumber(date), date.getDay())).toEqual(date);
    }
  });
});
