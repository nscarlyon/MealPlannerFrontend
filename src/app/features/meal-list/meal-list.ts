import { Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MealsService } from '../../api/generated/meals/meals.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, firstValueFrom, tap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FilterMealsDialog } from '../filter-meals-dialog/filter-meals-dialog';
import { CuisineType, MealType, PaginatedMealResponse } from '../../api/models';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { MealFilterDialogData } from '../filter-meals-dialog/meal-filter-dialog-data';

@Component({
  selector: 'app-meal-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    RouterLink,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatChipGrid,
    MatChipRow,
    MatChipInput,
    MatChipRemove,
  ],
  templateUrl: './meal-list.html',
  styleUrl: './meal-list.scss',
})
export class MealList {
  private readonly dialog = inject(MatDialog);
  private readonly mealService = inject(MealsService);
  protected readonly columnsToDisplay: string[] = ['name', 'type', 'cuisine'];

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly sortDirection = signal<boolean | undefined>(undefined);
  readonly searchInput = signal('');
  readonly mealTypeFilters = signal<MealType[]>([]);
  readonly cuisineFilters = signal<CuisineType[]>([]);

  readonly search = toSignal(
    toObservable(this.searchInput).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.pageIndex.set(0)),
    ),
    { initialValue: '' },
  );

  readonly mealsResource = resource({
    params: () => ({
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      sortDirection: this.sortDirection(),
      search: this.search(),
      filterByCuisineTypeList: this.cuisineFilters(),
      filterByMealTypeList: this.mealTypeFilters(),
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
    computation: (next, prev) => next?.meals ?? prev?.value ?? [],
  });

  // ToDo Totalcount should always be a number
  readonly totalCount = computed(() => Number(this.mealsResource.value()?.totalCount ?? 0));

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort): void {
    this.pageIndex.set(0);
    this.sortDirection.set(sort.direction === 'desc');
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.pageIndex.set(0);
    this.searchInput.set(value.trim());
  }

  protected openFilterDialog() {
    this.dialog
      .open(FilterMealsDialog, {
        data: {
          filterByMealTypeList: this.mealTypeFilters(),
          filterByCuisineTypeList: this.cuisineFilters(),
        },
      })
      .afterClosed()
      .subscribe((data: MealFilterDialogData | undefined) => {
        if (!data) return;
        this.mealTypeFilters.set(data.filterByMealTypeList);
        this.cuisineFilters.set(data.filterByCuisineTypeList);
        this.pageIndex.set(0);
      });
  }

  protected removeMealFilter(mealType: MealType) {
    this.mealTypeFilters.update((mealTypes) => mealTypes.filter((x) => x != mealType));
    this.pageIndex.set(0);
  }

  protected removeCuisineFilter(cuisine: CuisineType) {
    this.cuisineFilters.update((cuisines) => cuisines.filter((x) => x != cuisine));
    this.pageIndex.set(0);
  }
}
