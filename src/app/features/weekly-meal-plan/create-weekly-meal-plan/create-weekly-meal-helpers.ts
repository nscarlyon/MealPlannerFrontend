import { MealPlanItemRequest, WeeklyMealPlanResponse } from '../../../api/models';

export function arePlansDifferent(
  editablePlanItems: MealPlanItemRequest[],
  originalPlanItems: MealPlanItemRequest[],
): boolean {
  return planSignature(editablePlanItems) !== planSignature(originalPlanItems);
}
function planSignature(items: MealPlanItemRequest[]): string {
  return items
    .map((item) => `${item.mealId}|${item.date}|${item.sortOrder}`)
    .sort()
    .join(',');
}

export function toItemRequests(plan: WeeklyMealPlanResponse | undefined): MealPlanItemRequest[] {
  return (plan?.items ?? []).map((item) => ({
    mealId: item.mealId,
    date: item.date,
    sortOrder: item.sortOrder,
  }));
}

export function bySortOrder(a: { sortOrder: number }, b: { sortOrder: number }): number {
  return a.sortOrder - b.sortOrder;
}
