import { CuisineType, MealType } from '../../api/models';

export interface MealFilterDialogData {
  filterByMealTypeList: MealType[];
  filterByCuisineTypeList: CuisineType[];
}
