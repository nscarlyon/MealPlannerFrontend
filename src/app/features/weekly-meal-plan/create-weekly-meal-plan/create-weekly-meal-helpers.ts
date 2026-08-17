import { MealPlanItemRequest, WeeklyMealPlanResponse } from '../../../api/models';

export function planSignature(items: MealPlanItemRequest[]): string {
  return items
    .map((item) => `${item.mealId}|${item.date}|${item.sortOrder}`)
    .sort()
    .join(',');
}

export function toItemRequests(plan: WeeklyMealPlanResponse | undefined): MealPlanItemRequest[] {
  return (plan?.items ?? []).map((item) => ({
    mealId: item.mealId,
    day: item.day,
    date: item.date,
    sortOrder: item.sortOrder,
  }));
}

export function bySortOrder(a: { sortOrder: number }, b: { sortOrder: number }): number {
  return a.sortOrder - b.sortOrder;
}
