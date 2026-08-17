import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { DailyMealPlanItem } from './daily-meal-plan-item';
import { DateHelper } from '../DateHelper';
import { DayOfWeek } from '../../../api/models';

@Component({
  selector: 'app-view-weekly-meal-plan',
  imports: [DatePipe, MatChipSet, MatChip],
  templateUrl: './view-weekly-meal-plan.html',
  styleUrl: './view-weekly-meal-plan.scss',
})
export class ViewWeeklyMealPlan {
  readonly weekStartDate = input.required<Date>();
  /**
   * Emits the requested week. The parent decides whether to apply it (e.g. after
   * confirming unsaved changes), so this component never changes the week itself.
   */
  readonly weekStartDateChange = output<Date>();
  readonly weeklyMeals = input<DailyMealPlanItem[]>([]);
  readonly isSaving = input<boolean>(false);
  readonly save = output<void>();

  static readonly numericDayMap: Record<number, DayOfWeek> = {
    0: DayOfWeek.Sunday,
    1: DayOfWeek.Monday,
    2: DayOfWeek.Tuesday,
    3: DayOfWeek.Wednesday,
    4: DayOfWeek.Thursday,
    5: DayOfWeek.Friday,
    6: DayOfWeek.Saturday,
  };

  readonly days = computed(() => {
    const monday = this.weekStartDate();
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return { date: day, dayOfWeek: ViewWeeklyMealPlan.numericDayMap[day.getDay()] };
    });
  });

  readonly mealsByDate = computed(() => {
    const map = new Map<string, DailyMealPlanItem[]>();
    for (const item of this.weeklyMeals()) {
      const key = item.day;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  });

  getMealsForDay(day: DayOfWeek): DailyMealPlanItem[] {
    return this.mealsByDate().get(day) ?? [];
  }

  isToday(day: Date): boolean {
    return day.toDateString() === new Date().toDateString();
  }

  shiftWeek(weeks: number): void {
    const current = this.weekStartDate();
    const updated = new Date(current);
    updated.setDate(current.getDate() + weeks * 7);
    this.requestWeek(DateHelper.getMondayFromToday(updated));
  }

  goToToday(): void {
    this.requestWeek(DateHelper.getMondayFromToday(new Date()));
  }

  private requestWeek(monday: Date): void {
    if (DateHelper.isSameDay(monday, this.weekStartDate())) return;
    this.weekStartDateChange.emit(monday);
  }

  protected onSave(): void {
    this.save.emit();
  }
}
