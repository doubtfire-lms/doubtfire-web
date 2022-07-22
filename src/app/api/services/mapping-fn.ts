export class MappingFunctions {
  public static mapDateToEndOfDay(data, key, entity, params?) {
    const jsonDate = new Date(data[key]);
    return new Date(jsonDate.getFullYear(), jsonDate.getMonth(), jsonDate.getDate(), 23, 59, 59, 999);
  }

  public static mapDateToDay(data, key, entity, params?) {
    const jsonDate = new Date(data[key]);
    return new Date(jsonDate.getFullYear(), jsonDate.getMonth(), jsonDate.getDate());
  }

  public static mapDate(data, key, entity, params?) {
    return new Date(data[key]);
  }

  public static mapDayToJson<T>(entity: T, key: string): string {
    if (entity[key]) {
      const month = entity[key].getMonth() + 1;
      return `${entity[key].getFullYear()}-${month < 10 ? '0' : ''}${month}-${entity[key].getDate()}`;
    }
    else {
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
}
