import {
  formatDate } from '@angular/common';

export class DateHelper {
  static getMondayFromToday(today: Date) {
    const todayDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    const distanceToMonday = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek;

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + distanceToMonday);
    return mondayDate;
  }

  /**
   * Parses a `yyyy-MM-dd` string as a local-time date.
   * `new Date('yyyy-MM-dd')` parses as UTC midnight, which is the previous day
   * in time zones behind UTC.
   */
  static parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /** True if both dates fall on the same calendar day (local time). */
  static isSameDay(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
  }

  static getFormattedDate(date: Date = new Date()): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }
}
