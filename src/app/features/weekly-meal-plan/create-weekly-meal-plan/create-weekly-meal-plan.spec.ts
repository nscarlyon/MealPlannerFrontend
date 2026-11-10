import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CreateWeeklyMealPlan } from './create-weekly-meal-plan';
import { MealsService } from '../../../api/generated/meals/meals.service';
import { WeeklyMealPlanService } from '../../../api/generated/weekly-meal-plan/weekly-meal-plan.service';

describe('CreateWeeklyMealPlan', () => {
  let component: CreateWeeklyMealPlan;
  let fixture: ComponentFixture<CreateWeeklyMealPlan>;
  let mealsServiceMock: { getApiMeals: ReturnType<typeof vi.fn> };
  let weeklyMealPlanServiceMock: { getApiWeeklyMealPlanStartDate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mealsServiceMock = {
      getApiMeals: vi.fn().mockReturnValue(of({ meals: [] })),
    };
    weeklyMealPlanServiceMock = {
      getApiWeeklyMealPlanStartDate: vi.fn().mockReturnValue(of({ weekStartDate: '2026-10-20', items: [] })),
    };

    await TestBed.configureTestingModule({
      imports: [CreateWeeklyMealPlan],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MealsService, useValue: mealsServiceMock },
        { provide: WeeklyMealPlanService, useValue: weeklyMealPlanServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateWeeklyMealPlan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 7 day pill buttons with correct labels', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.day-pill');
    expect(buttons.length).toBe(7);

    const labels = Array.from(buttons).map((btn) => btn.textContent?.trim());
    expect(labels).toEqual(['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su']);
  });

  it('should reactively update number of meals when dropped', () => {
    const mondayPill = component.dayPills()[0];
    const mockDropEvent: any = {
      item: { data: mondayPill },
      container: { data: { mealId: 'meal-1', name: 'Pasta' } },
    };

    (component as any).onMealListDropped(mockDropEvent);
    expect(component.dayPills()[0].numberOfMeals).toBe(1);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.day-pill');
    expect(buttons[0].textContent?.replace(/\s+/g, ' ').trim()).toBe('M 1');
  });

  const drop = (dayIndex: number, mealId: string) =>
    (component as any).onMealListDropped({
      item: { data: component.dayPills()[dayIndex] },
      container: { data: { mealId } },
    });

  it('should not add the same meal to the same day twice', () => {
    drop(0, 'meal-1');
    drop(0, 'meal-1');
    expect(component.editablePlanItems().length).toBe(1);
    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('should re-number remaining meals on a day when one is removed', () => {
    drop(0, 'meal-1');
    drop(0, 'meal-2');
    drop(0, 'meal-3');
    const date = component.editablePlanItems()[0].date;

    (component as any).removeDayChip('meal-1', { planDate: date, sortOrder: 0 });

    expect(component.editablePlanItems().map((i) => [i.mealId, i.sortOrder])).toEqual([
      ['meal-2', 0],
      ['meal-3', 1],
    ]);
  });

  describe('infinite scroll', () => {
    const meal = (id: string) => ({ id, name: `Meal ${id}` });
    const pages: Record<number, { meals: { id: string; name: string }[]; totalPages: number }> = {
      1: { meals: [meal('a'), meal('b')], totalPages: 3 },
      2: { meals: [meal('b'), meal('c')], totalPages: 3 },
      3: { meals: [meal('d')], totalPages: 3 },
    };

    beforeEach(async () => {
      mealsServiceMock.getApiMeals.mockReset();
      mealsServiceMock.getApiMeals.mockImplementation(({ PageNumber }: { PageNumber: number }) =>
        of(pages[PageNumber]),
      );
      fixture = TestBed.createComponent(CreateWeeklyMealPlan);
      component = fixture.componentInstance;
      await fixture.whenStable();
    });

    it('appends the next page, without duplicates, when the end of the list is visible', async () => {
      expect(component.meals().map((m) => m.mealId)).toEqual(['a', 'b']);

      (component as any).onListEndVisibilityChange(true);
      await fixture.whenStable();

      expect(mealsServiceMock.getApiMeals).toHaveBeenLastCalledWith({ PageNumber: 2, PageSize: 20 });
      expect(component.meals().map((m) => m.mealId)).toEqual(['a', 'b', 'c']);
    });

    it('keeps every page when pages load back-to-back without the list being read', async () => {
      await (component as any).loadMoreMeals();
      await (component as any).loadMoreMeals();

      expect(component.mealIdsForDropListConnection()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('only loads a page when asked, and stops after the last one', async () => {
      expect(mealsServiceMock.getApiMeals).toHaveBeenCalledTimes(1);

      for (let i = 0; i < 4; i++) await (component as any).loadMoreMeals();

      const requestedPages = mealsServiceMock.getApiMeals.mock.calls.map(([p]) => p.PageNumber);
      expect(requestedPages).toEqual([1, 2, 3]);
    });
  });
});
