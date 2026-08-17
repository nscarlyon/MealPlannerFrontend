import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MealList } from './meal-list';
import { MealsService } from '../../api/generated/meals/meals.service';
import { MealResponse, MealType, PaginatedMealResponse } from '../../api/models';
import { PageEvent } from '@angular/material/paginator';

describe('MealList', () => {
  let component: MealList;
  let fixture: ComponentFixture<MealList>;
  let mealsServiceMock: { getApiMeals: ReturnType<typeof vi.fn> };

  const mockMeals: MealResponse[] = [
    {
      id: 'meal-1',
      name: 'Spaghetti Bolognese',
      description: 'Classic pasta dish',
      numberOfServings: 4,
      type: MealType.Dinner,
    },
    {
      id: 'meal-2',
      name: 'Pancakes',
      description: 'Fluffy breakfast pancakes',
      numberOfServings: 2,
      type: MealType.Breakfast,
    },
  ];

  const mockPaginatedResponse: PaginatedMealResponse = {
    meals: mockMeals,
    pageNumber: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    mealsServiceMock = {
      getApiMeals: vi.fn().mockReturnValue(of(mockPaginatedResponse)),
    };

    await TestBed.configureTestingModule({
      imports: [MealList],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MealsService, useValue: mealsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MealList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch meals and populate table dataSource', async () => {
    expect(mealsServiceMock.getApiMeals).toHaveBeenCalledWith({
      PageNumber: 1,
      PageSize: 10,
      IsDescending: undefined,
      SearchTerm: '',
      FilterByCuisineTypeList: [],
      FilterByMealTypeList: [],
    });
    expect(component.meals()).toEqual(mockMeals);
    expect(component.totalCount()).toBe(2);
  });

  it('should handle pagination changes', async () => {
    const pageEvent: PageEvent = {
      pageIndex: 1,
      pageSize: 20,
      length: 50,
    };

    component.onPageChange(pageEvent);
    expect(component.pageIndex()).toBe(1);
    expect(component.pageSize()).toBe(20);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(mealsServiceMock.getApiMeals).toHaveBeenCalledWith({
      PageNumber: 2,
      PageSize: 20,
      IsDescending: undefined,
      SearchTerm: '',
      FilterByCuisineTypeList: [],
      FilterByMealTypeList: [],
    });
  });

  it('should render Add Meal button with correct link and label', () => {
    const button = fixture.nativeElement.querySelector('.add-meal-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Add Meal');
    expect(button.getAttribute('routerLink') ?? button.getAttribute('ng-reflect-router-link')).toBe('/meals/add');
  });

  it('should render search form field with smaller height and filter icon', () => {
    const formField = fixture.nativeElement.querySelector('mat-form-field');
    expect(formField).toBeTruthy();
    expect(formField.getAttribute('subscriptsizing') ?? formField.getAttribute('ng-reflect-subscript-sizing')).toBe('dynamic');

    const filterIcon = formField.querySelector('mat-icon');
    expect(filterIcon).toBeTruthy();
    expect(filterIcon.textContent.trim()).toBe('filter_list');
  });

  it('should filter dataSource when applyFilter is called', () => {
    const event = {
      target: { value: '  SPAGHETTI  ' },
    } as unknown as Event;

    component.applyFilter(event);
    expect(component.searchInput()).toBe('SPAGHETTI');
  });

  it('should handle empty or null meals in response gracefully', async () => {
    mealsServiceMock.getApiMeals.mockReturnValue(of({ meals: [], totalCount: 0 }));
    component.pageIndex.set(2);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.meals()).toEqual([]);
    expect(component.totalCount()).toBe(0);
  });
});
