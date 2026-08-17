import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { MealResponse } from '../api/models';
import { inject } from '@angular/core';
import { MealsService } from '../api/generated/meals/meals.service';

export const mealsResolver: ResolveFn<MealResponse> = (
  route: ActivatedRouteSnapshot,
)=> {
  const id = route.paramMap.get('id')!;
  const mealsService = inject(MealsService);
  return mealsService.getApiMealsId(id);
};
