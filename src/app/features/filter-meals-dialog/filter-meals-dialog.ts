import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatChipListbox, MatChipOption, MatChipSelectionChange } from '@angular/material/chips';
import { CuisineType, GetApiMealsParams, MealType } from '../../api/models';

@Component({
  selector: 'app-filter-meals-dialog',
  imports: [MatChipListbox, MatChipOption, MatDialogModule],
  templateUrl: './filter-meals-dialog.html',
  styleUrl: './filter-meals-dialog.scss',
})
export class FilterMealsDialog {
  data = inject<GetApiMealsParams>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FilterMealsDialog>);
  private filters = signal<string[]>([
    ...(this.data?.FilterByCuisineTypeList ?? []),
    ...(this.data?.FilterByMealTypeList ?? []),
  ]);
  readonly mealTypes = Object.entries(MealType).map(([key, value]) => {
    return {
      value: value,
      label: key,
      selected: this.filters().includes(value),
    };
  });
  readonly cuisineTypes = Object.entries(CuisineType).map(([key, value]) => {
    return {
      value: value,
      label: key,
      selected: this.filters().includes(value),
    };
  });

  protected onSave() {
    const mealTypeFilters: MealType[] = [];
    const cuisineTypeFilters: CuisineType[] = [];
    const filters = this.filters();

    filters.forEach((filter: string) => {
      const mealType = MealType[filter as keyof typeof MealType];
      const cuisineType = CuisineType[filter as keyof typeof CuisineType];
      if (mealType) {
        mealTypeFilters.push(mealType);
      } else if (cuisineType) {
        cuisineTypeFilters.push(cuisineType);
      }
    });
    this.data.FilterByCuisineTypeList = cuisineTypeFilters;
    this.data.FilterByMealTypeList = mealTypeFilters;
    this.dialogRef.close(this.data);
  }

  protected onSelectFilter($event: MatChipSelectionChange) {
    const value = $event.source.value;
    if ($event.selected) {
      this.filters().push(value);
    } else {
      const index = this.filters().indexOf(value);
      this.filters().splice(index, 1);
    }
  }
}
