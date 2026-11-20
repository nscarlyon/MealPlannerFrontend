import { Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MealsService } from '../../api/generated/meals/meals.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { PaginatedMealResponse } from '../../api/models';
import { MealSearchState } from '../../shared/states/meal-search-state';
import { MealsSearchBar } from '../../shared/meals-search-bar/meals-search-bar';

@Component({
  selector: 'app-meal-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MealsSearchBar,
  ],
  providers: [MealSearchState],
  templateUrl: './meal-list.html',
  styleUrl: './meal-list.scss',
})
export class MealList {
  private readonly mealService = inject(MealsService);
  readonly searchState = inject(MealSearchState);
  protected readonly columnsToDisplay: string[] = ['name', 'type', 'cuisine'];

  readonly pageIndex = linkedSignal({
    source: () => ({
      search: this.searchState.search(),
      mealTypes: this.searchState.mealTypeFilters(),
      cuisines: this.searchState.cuisineFilters(),
    }),
    computation: () => 0,
  });
  readonly pageSize = signal(10);
  readonly sortDirection = signal<boolean | undefined>(undefined);

  readonly mealsResource = resource({
    params: () => ({
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      sortDirection: this.sortDirection(),
      search: this.searchState.search(),
      filterByCuisineTypeList: this.searchState.cuisineFilters(),
      filterByMealTypeList: this.searchState.mealTypeFilters(),
    }),
    loader: async ({ params }) => {
      return await firstValueFrom(
        this.mealService.getApiMeals({
          PageNumber: params.pageIndex + 1,
          PageSize: params.pageSize,
          IsDescending: params.sortDirection,
          SearchTerm: params.search,
          FilterByCuisineTypeList: params.filterByCuisineTypeList,
          FilterByMealTypeList: params.filterByMealTypeList,
        }),
      );
    },
  });
  readonly meals = linkedSignal<
    PaginatedMealResponse | undefined,
    NonNullable<PaginatedMealResponse['meals']>
  >({
    source: () => this.mealsResource.value(),
    computation: (next, prev) =>
      next?.meals
      ?? prev?.value
      ?? [],
  });

  readonly totalCount = computed(() => Number(this.mealsResource.value()?.totalCount ?? 0));

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort): void {
    this.pageIndex.set(0);
    this.sortDirection.set(sort.direction === 'desc');
  }
}
