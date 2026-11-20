import { Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CuisineType, MealType } from '../../api/models';
import { MealFilterDialogData } from '../meals-search-bar/filter-meals-dialog/meal-filter-dialog-data';

@Injectable()
export class MealSearchState {
  readonly searchInput = signal('');
  readonly mealTypeFilters = signal<MealType[]>([]);
  readonly cuisineFilters = signal<CuisineType[]>([]);

  readonly search = toSignal(
    toObservable(this.searchInput).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );

  setSearch(value: string): void {
    this.searchInput.set(value.trim());
  }

  setFilters(data: MealFilterDialogData): void {
    this.mealTypeFilters.set(data.filterByMealTypeList);
    this.cuisineFilters.set(data.filterByCuisineTypeList);
  }

  removeMealFilter(mealType: MealType): void {
    this.mealTypeFilters.update((mealTypes) => mealTypes.filter((x) => x !== mealType));
  }

  removeCuisineFilter(cuisine: CuisineType): void {
    this.cuisineFilters.update((cuisines) => cuisines.filter((x) => x !== cuisine));
  }
}
