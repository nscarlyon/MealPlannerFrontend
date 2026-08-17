import type { DayOfWeek } from '../../../api/models';

export interface DailyMealPlanItem {
  day: DayOfWeek;
  date: Date;
  sortOrder: number;
  mealName: string;
}
