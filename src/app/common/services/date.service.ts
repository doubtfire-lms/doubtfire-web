import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root', // Available throughout the app.
})
export class DateService {
  private monthNames: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  constructor() {
    // Bind the methods to ensure `this` context is correct
    this.showDate = this.showDate.bind(this);
    this.showFullDate = this.showFullDate.bind(this);
  }

  /**
   * Returns a dateString for the passed-in `date`,
   * in the format of `MMM-YYYY`.
   *
   * Note: If you are going to pass in a `dateString`, please ensure it is in
   * `ISO 8601` format.
   *
   * @param {string | Date} dateValue
   *
   * @returns {string}
   */
  showDate(dateValue?: string | Date): string {
    if (dateValue) {
      const date = new Date(dateValue);

      return `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } else {
      return '-';
    }
  }

  /**
   * Returns a dateString for the passed-in `date`,
   * in the format of `D-MM-YYYY`.
   *
   *  Note: If you are going to pass in a `dateString`, please ensure it is in
   * `ISO 8601` format.
   *
   * @param {string | Date} dateValue
   *
   * @returns {string}
   */
  showFullDate(dateValue?: string | Date): string {
    if (dateValue) {
      const date = new Date(dateValue);

      return `${date.getDate()} ${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } else {
      return '-';
    }
  }
}
