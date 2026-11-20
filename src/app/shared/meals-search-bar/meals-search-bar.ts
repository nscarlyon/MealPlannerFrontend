import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CuisineType, MealType } from '../../api/models';
import { FilterMealsDialog } from './filter-meals-dialog/filter-meals-dialog';
import { MealFilterDialogData } from './filter-meals-dialog/meal-filter-dialog-data';
import { MealSearchState } from '../states/meal-search-state';

@Component({
  selector: 'app-meals-search-bar',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatChipGrid,
    MatChipRow,
    MatChipInput,
    MatChipRemove,
  ],
  templateUrl: './meals-search-bar.html',
  styleUrl: './meals-search-bar.scss',
})
export class MealsSearchBar {
  private readonly dialog = inject(MatDialog);
  private readonly state = inject(MealSearchState);

  protected readonly mealTypeFilters = this.state.mealTypeFilters;
  protected readonly cuisineFilters = this.state.cuisineFilters;

  applyFilter(event: Event): void {
    this.state.setSearch((event.target as HTMLInputElement).value);
  }

  protected openFilterDialog(): void {
    this.dialog
      .open(FilterMealsDialog, {
        data: {
          filterByMealTypeList: this.mealTypeFilters(),
          filterByCuisineTypeList: this.cuisineFilters(),
        },
      })
      .afterClosed()
      .subscribe((data: MealFilterDialogData | undefined) => {
        if (data) this.state.setFilters(data);
      });
  }

  protected removeMealFilter(mealType: MealType): void {
    this.state.removeMealFilter(mealType);
  }

  protected removeCuisineFilter(cuisine: CuisineType): void {
    this.state.removeCuisineFilter(cuisine);
  }
}
