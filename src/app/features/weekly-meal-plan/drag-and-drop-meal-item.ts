import { CuisineType, MealType } from '../../api/models';

export interface DragAndDropDay {
  dayOfWeekLabel: string;
  /** Original yyyy-MM-dd date string from the plan item, used to match it back. */
  planDate: string;
  sortOrder: number;
  className: string;
}

export interface DragAndDropMealItem {
  assignedDays: DragAndDropDay[];
  mealId: string;
  name: string;
  type?: MealType;
  cuisine?: null | CuisineType;
}

