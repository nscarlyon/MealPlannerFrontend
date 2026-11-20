import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatChipListbox, MatChipOption, MatChipSelectionChange } from '@angular/material/chips';
import { CuisineType, MealType } from '../../../api/models';
import { MealFilterDialogData } from './meal-filter-dialog-data';

@Component({
  selector: 'app-filter-meals-dialog',
  imports: [MatChipListbox, MatChipOption, MatDialogModule],
  templateUrl: './filter-meals-dialog.html',
  styleUrl: './filter-meals-dialog.scss',
})
export class FilterMealsDialog {
  data = inject<MealFilterDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<FilterMealsDialog, MealFilterDialogData>>(MatDialogRef);
  private readonly selectedMealTypes = new Set<MealType>(this.data?.filterByMealTypeList ?? []);
  private readonly selectedCuisines = new Set<CuisineType>(this.data?.filterByCuisineTypeList ?? []);

  readonly mealTypes = Object.entries(MealType)
    .filter(([, value]) => value !== MealType.None)
    .map(([key, value]) => ({
      value,
      label: key,
      selected: this.selectedMealTypes.has(value),
    }));
  readonly cuisineTypes = Object.entries(CuisineType)
    .filter(([, value]) => value !== CuisineType.None)
    .map(([key, value]) => ({
      value,
      label: key,
      selected: this.selectedCuisines.has(value),
    }));

  protected onSave(): void {
    this.dialogRef.close({
      filterByMealTypeList: [...this.selectedMealTypes],
      filterByCuisineTypeList: [...this.selectedCuisines],
    });
  }

  protected onSelectMealType(event: MatChipSelectionChange): void {
    this.toggle(this.selectedMealTypes, event);
  }

  protected onSelectCuisine(event: MatChipSelectionChange): void {
    this.toggle(this.selectedCuisines, event);
  }

  private toggle<T>(selection: Set<T>, event: MatChipSelectionChange): void {
    if (event.selected) {
      selection.add(event.source.value);
    } else {
      selection.delete(event.source.value);
    }
  }
}
