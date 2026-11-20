import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FilterMealsDialog } from './filter-meals-dialog';
import { CuisineType, MealType } from '../../../api/models';
import { By } from '@angular/platform-browser';
import { MatChipOption } from '@angular/material/chips';

describe('FilterMealsDialog', () => {
  let component: FilterMealsDialog;
  let fixture: ComponentFixture<FilterMealsDialog>;
  let dialogRefSpy: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialogRefSpy = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FilterMealsDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { filterByMealTypeList: [MealType.Breakfast], filterByCuisineTypeList: [] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterMealsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose mealTypes and cuisineTypes from enums with selection status', () => {
    expect(component.mealTypes).toEqual(
      Object.entries(MealType)
        .filter(([, value]) => value !== MealType.None)
        .map(([key, value]) => ({
          value,
          label: key,
          selected: value === MealType.Breakfast,
        })),
    );
    expect(component.cuisineTypes).toEqual(
      Object.entries(CuisineType)
        .filter(([, value]) => value !== CuisineType.None)
        .map(([key, value]) => ({
          value,
          label: key,
          selected: false,
        })),
    );
  });

  it('should render chip options for each mealType and cuisineType except None', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const chips = Array.from(compiled.querySelectorAll('mat-chip-option'));
    // Minus one "None" option from each enum.
    expect(chips.length).toBe(
      Object.values(MealType).length + Object.values(CuisineType).length - 2,
    );
    expect(chips.some((chip) => chip.textContent?.trim() === 'None')).toBe(false);
  });

  it('should return meal type and cuisine selections separately on save', () => {
    fixture.detectChanges();
    const italian = fixture.debugElement
      .queryAll(By.directive(MatChipOption))
      .map((el) => el.injector.get(MatChipOption))
      .find((chip) => chip.value === CuisineType.Italian)!;
    italian.select();
    (component as unknown as { onSave: () => void }).onSave();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      filterByMealTypeList: [MealType.Breakfast],
      filterByCuisineTypeList: [CuisineType.Italian],
    });
  });
});
