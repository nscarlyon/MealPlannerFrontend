import { CuisineType, MealIngredient, MealType } from '../../api/models';

export interface MealFormModel {
  name: string;
  description: string;
  numberOfServings: number;
  type: MealType;
  cuisine: CuisineType;
  ingredients: MealIngredient[];
}

