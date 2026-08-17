import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FilterMealsDialog } from './filter-meals-dialog';
import { CuisineType, MealType } from '../../api/models';

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
        { provide: MAT_DIALOG_DATA, useValue: { FilterByMealTypeList: [MealType.Breakfast] } },
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
      Object.entries(MealType).map(([key, value]) => ({
        value,
        label: key,
        selected: value === MealType.Breakfast,
      })),
    );
    expect(component.cuisineTypes).toEqual(
      Object.entries(CuisineType).map(([key, value]) => ({
        value,
        label: key,
        selected: false,
      })),
    );
  });

  it('should render chip options for each mealType and cuisineType', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const chips = compiled.querySelectorAll('mat-chip-option');
    expect(chips.length).toBe(
      Object.values(MealType).length + Object.values(CuisineType).length,
    );
  });
});
