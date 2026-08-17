import { DayOfWeek } from '../../api/models';
import { DateHelper } from './DateHelper';

export interface DayPill {
  label: string;
  name: DayOfWeek;
  className: string;
  numberOfMeals: number;
  date: Date;
}

export class DayPillHelper {

  static getDayPills(referenceDate: Date = new Date()): DayPill[] {
    const dates = this.getDatesForWeek(referenceDate);
    return [
      {
        label: 'M',
        name: DayOfWeek.Monday,
        className: 'pill-m',
        numberOfMeals: 0,
        date: dates[0],
      },
      {
        label: 'Tu',
        name: DayOfWeek.Tuesday,
        className: 'pill-tu',
        numberOfMeals: 0,
        date: dates[1],
      },
      {
        label: 'W',
        name: DayOfWeek.Wednesday,
        className: 'pill-w',
        numberOfMeals: 0,
        date: dates[2],
      },
      {
        label: 'Th',
        name: DayOfWeek.Thursday,
        className: 'pill-th',
        numberOfMeals: 0,
        date: dates[3],
      },
      {
        label: 'F',
        name: DayOfWeek.Friday,
        className: 'pill-f',
        numberOfMeals: 0,
        date: dates[4],
      },
      {
        label: 'Sa',
        name: DayOfWeek.Saturday,
        className: 'pill-sa',
        numberOfMeals: 0,
        date: dates[5],
      },
      {
        label: 'Su',
        name: DayOfWeek.Sunday,
        className: 'pill-su',
        numberOfMeals: 0,
        date: dates[6],
      },
    ];
  }

  static getDatesForWeek(referenceDate: Date = new Date()): Date[] {
    const today = new Date(referenceDate);
    const mondayDate = DateHelper.getMondayFromToday(today);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

}
