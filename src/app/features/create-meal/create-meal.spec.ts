import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { CuisineType, MealResponse, MealType } from '../../api/models';
import { CreateMeal } from './create-meal';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MealsService } from '../../api/generated/meals/meals.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('CreateMeal', () => {
  let component: CreateMeal;
  let fixture: ComponentFixture<CreateMeal>;
  let mealsServiceMock: { getApiMealsId: ReturnType<typeof vi.fn> };
  let paramMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const mockMeal: MealResponse = {
    id: 'meal-123',
    name: 'Spaghetti Bolognese',
    description: 'Classic Italian pasta dish',
    numberOfServings: 4,
    type: MealType.Dinner,
    cuisine: CuisineType.Italian,
  };

  beforeEach(async () => {
    paramMapSubject = new BehaviorSubject(convertToParamMap({}));
    mealsServiceMock = {
      getApiMealsId: vi.fn().mockReturnValue(of(mockMeal)),
    };

    await TestBed.configureTestingModule({
      imports: [CreateMeal],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MealsService, useValue: mealsServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMeal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //
  // it('should expose all MealType values', () => {
  //   expect(component.mealTypes).toEqual(Object.values(MealType));
  // });
  //
  // it('should expose all CuisineType values', () => {
  //   expect(component.cuisineTypes).toEqual(Object.values(CuisineType));
  // });
  //
  // it('should keep form empty when mealId is not provided', () => {
  //   expect(mealsServiceMock.getApiMealsId).not.toHaveBeenCalled();
  //   expect(component.mealResponse.value()).toBeUndefined();
  //   expect(component.firstFormStep.value.mealName).toBe('');
  //   expect(component.firstFormStep.value.mealDescription).toBe('');
  //   expect(component.secondFormStep.value.numberOfServings).toBe(2);
  //   expect(component.secondFormStep.value.mealType).toBe(MealType.Dinner);
  //   expect(component.secondFormStep.value.cuisine).toBe(CuisineType.None);
  // });
  //
  // it('should fetch meal data and populate form when mealId is provided', async () => {
  //   paramMapSubject.next(convertToParamMap({ id: 'meal-123' }));
  //   fixture.detectChanges();
  //   await fixture.whenStable();
  //
  //   expect(mealsServiceMock.getApiMealsId).toHaveBeenCalledWith('meal-123');
  //   expect(component.mealResponse.value()).toEqual(mockMeal);
  //   expect(component.firstFormStep.value.mealName).toBe('Spaghetti Bolognese');
  //   expect(component.firstFormStep.value.mealDescription).toBe('Classic Italian pasta dish');
  //   expect(component.secondFormStep.value.numberOfServings).toBe(4);
  //   expect(component.secondFormStep.value.mealType).toBe(MealType.Dinner);
  //   expect(component.secondFormStep.value.cuisine).toBe(CuisineType.Italian);
  // });
});
