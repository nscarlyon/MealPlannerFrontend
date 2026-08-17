import { ChangeDetectionStrategy, Component, computed, inject, model, output, resource, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { DayOfWeek, MonthlyMealPlanResponse } from '../../api/models';
import { DailyMealPlanItem } from '../weekly-meal-plan/view-weekly-meal-plan/daily-meal-plan-item';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DateHelper } from '../weekly-meal-plan/DateHelper';
import { firstValueFrom } from 'rxjs';
import { MonthlyMealPlanService } from '../../api/generated/monthly-meal-plan/monthly-meal-plan.service';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  dayOfWeek: DayOfWeek;
  meals: DailyMealPlanItem[];
}

@Component({
  selector: 'app-monthly-meal-plan',
  imports: [DatePipe, MatChipSet, MatChip, RouterLink, RouterLinkActive],
  templateUrl: './monthly-meal-plan.html',
  styleUrl: './monthly-meal-plan.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyMealPlan {
  private readonly monthlyMealPlanService = inject(MonthlyMealPlanService);
  readonly currentDate = signal<Date>(new Date());
  readonly selectedDate = model<Date | undefined>(undefined);
  readonly daySelected = output<Date>();

  readonly monthlyMealPlanResource = resource({
    params: () => DateHelper.getFormattedDate(this.currentDate()),
    loader: async ({ params }) => {
      return firstValueFrom(
        this.monthlyMealPlanService.getApiMonthlyMealPlanRequest<MonthlyMealPlanResponse>(params),
      ).catch(() => undefined);
    },
  });

  readonly weekdays: readonly string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  static readonly numericDayMap: Record<number, DayOfWeek> = {
    0: DayOfWeek.Sunday,
    1: DayOfWeek.Monday,
    2: DayOfWeek.Tuesday,
    3: DayOfWeek.Wednesday,
    4: DayOfWeek.Thursday,
    5: DayOfWeek.Friday,
    6: DayOfWeek.Saturday,
  };

  readonly mealsByDate = computed(() => {
    const map = new Map<string, DailyMealPlanItem[]>();
    const weeks = this.monthlyMealPlanResource.value()?.weeklyMealPlans ?? [];

    for (const week of weeks) {
      for (const item of week.items ?? []) {
        if (!item.date) continue;

        const date =
          typeof item.date === 'string' && !item.date.includes('T')
            ? DateHelper.parseDate(item.date)
            : new Date(item.date);
        const key = DateHelper.getFormattedDate(date);

        const mealItem: DailyMealPlanItem = {
          day: item.day,
          mealName: item.meal?.name ?? '',
          date,
          sortOrder: item.sortOrder,
        };

        const existing = map.get(key) ?? [];
        existing.push(mealItem);
        existing.sort((a, b) => a.sortOrder - b.sortOrder);
        map.set(key, existing);
      }
    }

    return map;
  });

  readonly days = computed<CalendarDay[]>(() => {
    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    const prevDaysCount = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const totalDays = Math.ceil((prevDaysCount + lastDayOfMonth.getDate()) / 7) * 7;

    const mealsByDate = this.mealsByDate();
    const selected = this.selectedDate();
    const today = new Date();

    const days: CalendarDay[] = [];
    for (let i = 0; i < totalDays; i++) {
      const dayDate = new Date(year, month, 1 - prevDaysCount + i);

      const isCurrentMonth = dayDate.getMonth() === month && dayDate.getFullYear() === year;
      const isToday = DateHelper.isSameDay(dayDate, today);
      const isSelected = selected ? DateHelper.isSameDay(dayDate, selected) : false;
      const dayOfWeek = MonthlyMealPlan.numericDayMap[dayDate.getDay()];
      const dayMeals = mealsByDate.get(DateHelper.getFormattedDate(dayDate)) ?? [];

      days.push({
        date: dayDate,
        dayNumber: dayDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        dayOfWeek,
        meals: dayMeals,
      });
    }
    return days;
  });

  isToday(date: Date): boolean {
    return DateHelper.isSameDay(date, new Date());
  }

  shiftMonth(months: number): void {
    const current = this.currentDate();
    const updated = new Date(current.getFullYear(), current.getMonth() + months, 1);
    this.currentDate.set(updated);
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  selectDate(date: Date): void {
    this.selectedDate.set(date);
    this.daySelected.emit(date);
  }
}
