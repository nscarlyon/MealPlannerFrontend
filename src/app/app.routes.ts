import { Routes } from '@angular/router';
import { MealList } from './features/meal-list/meal-list';
import { CreateMeal } from './features/create-meal/create-meal';
import { CreateWeeklyMealPlan } from './features/weekly-meal-plan/create-weekly-meal-plan/create-weekly-meal-plan';
import { MonthlyMealPlan } from './features/monthly-meal-plan/monthly-meal-plan';
import { ViewMeal } from './features/view-meal/view-meal';
import { ViewShoppingList } from './features/view-shopping-list/view-shopping-list';
import { mealsResolver } from './resolvers/MealsResolver';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/meal-plan',
    pathMatch: 'full',
  },
  {
    path: 'meal-plan',
    component: MonthlyMealPlan,
  },
  {
    path: 'create-meal-plan',
    component: CreateWeeklyMealPlan,
    canDeactivate: [unsavedChangesGuard],
  },
  {
    path: 'meals',
    component: MealList,
  },
  {
    path: 'meals/add',
    component: CreateMeal,
  },
  {
    path: 'meals/:id',
    component: ViewMeal,
    resolve: {
      meal: mealsResolver,
    },
  },
  {
    path: 'edit-meal/:id',
    component: CreateMeal,
  },
  {
    path: 'shopping-list',
    component: ViewShoppingList,
  },
];
