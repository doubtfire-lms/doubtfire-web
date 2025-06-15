import moment from 'moment';

export class MappingFunctions {
  public static mapDateToEndOfDay(data, key, _entity, _params?) {
    const jsonDate = new Date(data[key]);
    return new Date(
      jsonDate.getFullYear(),
      jsonDate.getMonth(),
      jsonDate.getDate(),
      23, // all dates map to end of day
      59,
      59,
      999,
    );
  }

  public static mapDateToDay(data, key: string, _entity, _params?) {
    const jsonDate = new Date(data[key]);
    return new Date(jsonDate.getFullYear(), jsonDate.getMonth(), jsonDate.getDate());
  }

  public static mapDate(data, key: string, _entity, _params?) {
    return new Date(data[key]);
  }

  public static mapDayToJson<T>(entity: T, key: string): string {
    if (entity[key]) {
      const dateValue = moment.isMoment(entity[key]) ? entity[key].toDate() : entity[key];
      const month = dateValue.getMonth() + 1;
      const day = dateValue.getDate();
      return `${dateValue.getFullYear()}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    } else {
      return undefined;
    }
  }

  public static minutesMs(value: number): number {
    return 1000 * 60 * value;
  }

  public static hourMs(value: number): number {
    return 60 * this.minutesMs(1) * value;
  }

  public static dayMs(value: number): number {
    return 24 * this.hourMs(1) * value;
  }

  public static weeksMs(value: number): number {
    return 7 * this.dayMs(1) * value;
  }

  public static step(start: number, limit: number, stepValue: number): number[] {
    const result: number[] = [];

    for (let val = start; val <= limit; val += stepValue) {
      result.push(val);
    }

    return result;
  }

  /**
   * Calculate the time between two dates
   *
   * @param date1 days from this date
   * @param date2 to this date
   * @returns the time from date1 to date2
   */
  public static timeBetween(date1: Date, date2: Date): number {
    return date2.getTime() - date1.getTime();
  }

  /**
   * Calculate the number of days between two dates
   *
   * @param date1 days from this date
   * @param date2 to this date
   * @returns the days from date1 to date2
   */
  public static daysBetween(date1: Date, date2: Date): number {
    const diff = this.timeBetween(date1, date2);
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  /**
   * Calculate the number of days between two dates
   *
   * @param date1 days from this date
   * @param date2 to this date
   * @returns the days from date1 to date2
   */
  public static weeksBetween(date1: Date, date2: Date): number {
    const diff = this.daysBetween(date1, date2);
    return Math.ceil(diff / 7);
  }

  /**
   * Calculate the date that is a number of days after a given date
   *
   * @param date start date
   * @param days number of days to add
   * @returns the date that is that many days after the start date
   */
  public static daysAfter(date: Date, days: number): Date {
    return new Date(date.getTime() + this.dayMs(days));
  }
}
