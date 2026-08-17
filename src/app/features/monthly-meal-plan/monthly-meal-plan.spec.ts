import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MonthlyMealPlan } from './monthly-meal-plan';
import { DayOfWeek, MonthlyMealPlanResponse } from '../../api/models';
import { MonthlyMealPlanService } from '../../api/generated/monthly-meal-plan/monthly-meal-plan.service';

describe('MonthlyMealPlan', () => {
  let component: MonthlyMealPlan;
  let fixture: ComponentFixture<MonthlyMealPlan>;
  let monthlyMealPlanServiceMock: { getApiMonthlyMealPlanRequest: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    monthlyMealPlanServiceMock = {
      getApiMonthlyMealPlanRequest: vi.fn().mockReturnValue(of({ weeklyMealPlans: [] } as MonthlyMealPlanResponse)),
    };

    await TestBed.configureTestingModule({
      imports: [MonthlyMealPlan],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: MonthlyMealPlanService, useValue: monthlyMealPlanServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyMealPlan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with weekdays and default current date', () => {
    expect(component.weekdays).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(component.currentDate()).toBeInstanceOf(Date);
    expect(component.selectedDate()).toBeUndefined();
  });

  it('should calculate days grid correctly for a month starting on Thursday (October 2026)', () => {
    // October 2026: Oct 1 is Thursday (getDay() = 4).
    // Starting on Monday: previous days from Sep are Mon Sep 28, Tue Sep 29, Wed Sep 30 (3 days).
    // Total days in Oct = 31.
    // Total grid cells = Math.ceil((3 + 31) / 7) * 7 = 35 cells.
    component.currentDate.set(new Date(2026, 9, 15)); // October 2026
    const days = component.days();

    expect(days.length).toBe(35);

    // First cell is Sep 28, 2026 (Monday)
    expect(days[0].date.getFullYear()).toBe(2026);
    expect(days[0].date.getMonth()).toBe(8); // September
    expect(days[0].dayNumber).toBe(28);
    expect(days[0].isCurrentMonth).toBe(false);
    expect(days[0].dayOfWeek).toBe(DayOfWeek.Monday);

    // Cell at index 3 is Oct 1, 2026 (Thursday)
    expect(days[3].date.getMonth()).toBe(9); // October
    expect(days[3].dayNumber).toBe(1);
    expect(days[3].isCurrentMonth).toBe(true);
    expect(days[3].dayOfWeek).toBe(DayOfWeek.Thursday);

    // Cell at index 33 is Oct 31, 2026 (Saturday)
    expect(days[33].dayNumber).toBe(31);
    expect(days[33].isCurrentMonth).toBe(true);
    expect(days[33].dayOfWeek).toBe(DayOfWeek.Saturday);

    // Last cell at index 34 is Nov 1, 2026 (Sunday)
    expect(days[34].date.getMonth()).toBe(10); // November
    expect(days[34].dayNumber).toBe(1);
    expect(days[34].isCurrentMonth).toBe(false);
    expect(days[34].dayOfWeek).toBe(DayOfWeek.Sunday);
  });

  it('should calculate days grid correctly for a month starting on Sunday (March 2026)', () => {
    // March 2026: March 1 is Sunday (getDay() = 0).
    // Monday-first grid: previous days from Feb are 6 days (Mon Feb 23 to Sat Feb 28).
    // Total days in March = 31.
    // Total grid cells = Math.ceil((6 + 31) / 7) * 7 = 42 cells.
    component.currentDate.set(new Date(2026, 2, 1)); // March 2026
    const days = component.days();

    expect(days.length).toBe(42);
    expect(days[0].dayNumber).toBe(23); // Feb 23
    expect(days[0].isCurrentMonth).toBe(false);
    expect(days[0].dayOfWeek).toBe(DayOfWeek.Monday);

    expect(days[6].dayNumber).toBe(1); // March 1
    expect(days[6].isCurrentMonth).toBe(true);
    expect(days[6].dayOfWeek).toBe(DayOfWeek.Sunday);
  });

  it('should calculate days grid correctly for a month starting on Monday (June 2026)', () => {
    // June 2026: June 1 is Monday (getDay() = 1).
    // Monday-first grid: prevDaysCount = 0.
    // Total days in June = 30.
    // Total grid cells = Math.ceil((0 + 30) / 7) * 7 = 35 cells.
    component.currentDate.set(new Date(2026, 5, 1));
    const days = component.days();

    expect(days.length).toBe(35);
    expect(days[0].dayNumber).toBe(1);
    expect(days[0].isCurrentMonth).toBe(true);
    expect(days[0].dayOfWeek).toBe(DayOfWeek.Monday);
  });

  it('should shift month backwards and forwards', () => {
    component.currentDate.set(new Date(2026, 5, 15)); // June 15, 2026

    component.shiftMonth(1); // July 2026
    expect(component.currentDate().getMonth()).toBe(6);
    expect(component.currentDate().getFullYear()).toBe(2026);
    expect(component.currentDate().getDate()).toBe(1);

    component.shiftMonth(-1); // June 2026
    expect(component.currentDate().getMonth()).toBe(5);
    expect(component.currentDate().getFullYear()).toBe(2026);

    component.shiftMonth(-6); // December 2025
    expect(component.currentDate().getMonth()).toBe(11);
    expect(component.currentDate().getFullYear()).toBe(2025);
  });

  it('should return to today when goToToday is called', () => {
    component.currentDate.set(new Date(2020, 0, 1));
    component.goToToday();

    const today = new Date();
    expect(component.currentDate().getFullYear()).toBe(today.getFullYear());
    expect(component.currentDate().getMonth()).toBe(today.getMonth());
    expect(component.currentDate().getDate()).toBe(today.getDate());
  });

  it('should select date and emit daySelected output', () => {
    const emitSpy = vi.spyOn(component.daySelected, 'emit');
    const targetDate = new Date(2026, 9, 10);

    component.selectDate(targetDate);

    expect(component.selectedDate()).toBe(targetDate);
    expect(emitSpy).toHaveBeenCalledWith(targetDate);
  });

  it('should mark day as isSelected when selectedDate matches', () => {
    component.currentDate.set(new Date(2026, 9, 1));
    component.selectedDate.set(new Date(2026, 9, 15));

    const selectedDay = component.days().find((d) => d.dayNumber === 15 && d.isCurrentMonth);
    const nonSelectedDay = component.days().find((d) => d.dayNumber === 16 && d.isCurrentMonth);

    expect(selectedDay?.isSelected).toBe(true);
    expect(nonSelectedDay?.isSelected).toBe(false);
  });

  it('should correctly identify today with isToday', () => {
    const today = new Date();
    const otherDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    expect(component.isToday(today)).toBe(true);
    expect(component.isToday(otherDate)).toBe(false);
  });

  it('should map and sort meals by sortOrder for corresponding calendar days', async () => {
    const mockResponse: MonthlyMealPlanResponse = {
      weeklyMealPlans: [
        {
          id: 'week-1',
          weekStartDate: '2026-10-12',
          weekEndDate: '2026-10-18',
          items: [
            {
              id: 'item-1',
              day: DayOfWeek.Thursday,
              date: '2026-10-15',
              sortOrder: 1,
              mealId: 'meal-1',
              meal: { id: 'meal-1', name: 'Garlic Bread' },
            },
            {
              id: 'item-2',
              day: DayOfWeek.Thursday,
              date: '2026-10-15',
              sortOrder: 0,
              mealId: 'meal-2',
              meal: { id: 'meal-2', name: 'Spaghetti Bolognese' },
            },
            {
              id: 'item-3',
              day: DayOfWeek.Friday,
              date: '2026-10-16',
              sortOrder: 0,
              mealId: 'meal-3',
              meal: { id: 'meal-3', name: 'Pizza' },
            },
          ],
        },
      ],
    };

    monthlyMealPlanServiceMock.getApiMonthlyMealPlanRequest.mockReturnValue(of(mockResponse));
    component.currentDate.set(new Date(2026, 9, 1));
    await fixture.whenStable();

    const mealsMap = component.mealsByDate();
    expect(mealsMap.has('2026-10-15')).toBe(true);
    expect(mealsMap.has('2026-10-16')).toBe(true);

    const oct15Meals = mealsMap.get('2026-10-15')!;
    expect(oct15Meals.length).toBe(2);
    // Verified sorted by sortOrder
    expect(oct15Meals[0].mealName).toBe('Spaghetti Bolognese');
    expect(oct15Meals[0].sortOrder).toBe(0);
    expect(oct15Meals[1].mealName).toBe('Garlic Bread');
    expect(oct15Meals[1].sortOrder).toBe(1);

    const dayWithMeals = component.days().find((d) => d.dayNumber === 15 && d.isCurrentMonth);
    expect(dayWithMeals).toBeDefined();
    expect(dayWithMeals?.meals.length).toBe(2);
    expect(dayWithMeals?.meals[0].mealName).toBe('Spaghetti Bolognese');
    expect(dayWithMeals?.meals[1].mealName).toBe('Garlic Bread');
  });

  it('should handle service errors gracefully and return empty meals map', async () => {
    monthlyMealPlanServiceMock.getApiMonthlyMealPlanRequest.mockReturnValue(throwError(() => new Error('API Error')));
    component.currentDate.set(new Date(2026, 9, 1));
    await fixture.whenStable();

    expect(component.mealsByDate().size).toBe(0);
    const day = component.days().find((d) => d.dayNumber === 1 && d.isCurrentMonth);
    expect(day?.meals).toEqual([]);
  });

  it('should ignore meal items without a date', async () => {
    const mockResponse: MonthlyMealPlanResponse = {
      weeklyMealPlans: [
        {
          id: 'week-1',
          weekStartDate: '2026-10-12',
          weekEndDate: '2026-10-18',
          items: [
            {
              id: 'item-1',
              day: DayOfWeek.Thursday,
              date: '',
              sortOrder: 0,
              mealId: 'meal-1',
              meal: { id: 'meal-1', name: 'Mystery Meal' },
            },
          ],
        },
      ],
    };

    monthlyMealPlanServiceMock.getApiMonthlyMealPlanRequest.mockReturnValue(of(mockResponse));
    component.currentDate.set(new Date(2026, 9, 1));
    await fixture.whenStable();

    expect(component.mealsByDate().size).toBe(0);
  });

  it('should render header with formatted month and buttons', async () => {
    component.currentDate.set(new Date(2026, 9, 1)); // October 2026
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.month-title');
    expect(title?.textContent?.trim()).toBe('October 2026');

    const buttons = compiled.querySelectorAll('.calendar-header button');
    expect(buttons.length).toBe(4);
  });

  it('should render weekday headers and calendar day elements in template', async () => {
    component.currentDate.set(new Date(2026, 9, 1));
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const weekdayHeaders = compiled.querySelectorAll('.weekday-header');
    expect(weekdayHeaders.length).toBe(7);
    expect(weekdayHeaders[0].textContent?.trim()).toBe('Mon');
    expect(weekdayHeaders[6].textContent?.trim()).toBe('Sun');

    const dayCells = compiled.querySelectorAll('.calendar-day');
    expect(dayCells.length).toBe(35);
  });

  it('should call shiftMonth and goToToday when header buttons are clicked', async () => {
    const shiftSpy = vi.spyOn(component, 'shiftMonth');
    const todaySpy = vi.spyOn(component, 'goToToday');

    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll<HTMLButtonElement>('.calendar-header button');

    // Button 0: Previous month
    buttons[0].click();
    expect(shiftSpy).toHaveBeenCalledWith(-1);

    // Button 1: Today
    buttons[1].click();
    expect(todaySpy).toHaveBeenCalled();

    // Button 2: Next month
    buttons[2].click();
    expect(shiftSpy).toHaveBeenCalledWith(1);
  });

  it('should select day when clicked or keyboard activated', async () => {
    const selectSpy = vi.spyOn(component, 'selectDate');
    component.currentDate.set(new Date(2026, 9, 1));
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const dayCells = compiled.querySelectorAll<HTMLElement>('.calendar-day');
    expect(dayCells.length).toBeGreaterThan(0);

    // Click
    dayCells[3].click(); // Oct 1, 2026
    expect(selectSpy).toHaveBeenCalledWith(component.days()[3].date);

    // Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' });
    dayCells[4].dispatchEvent(enterEvent);
    expect(selectSpy).toHaveBeenCalledWith(component.days()[4].date);

    // Space key
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', code: 'Space', cancelable: true });
    dayCells[5].dispatchEvent(spaceEvent);
    expect(selectSpy).toHaveBeenCalledWith(component.days()[5].date);
  });

  it('should render mat-chips when a day has meals', async () => {
    const mockResponse: MonthlyMealPlanResponse = {
      weeklyMealPlans: [
        {
          id: 'week-1',
          weekStartDate: '2026-10-12',
          weekEndDate: '2026-10-18',
          items: [
            {
              id: 'item-1',
              day: DayOfWeek.Thursday,
              date: '2026-10-15',
              sortOrder: 0,
              mealId: 'meal-1',
              meal: { id: 'meal-1', name: 'Lasagna' },
            },
          ],
        },
      ],
    };

    monthlyMealPlanServiceMock.getApiMonthlyMealPlanRequest.mockReturnValue(of(mockResponse));
    component.currentDate.set(new Date(2026, 9, 1));
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const chips = compiled.querySelectorAll('mat-chip');
    expect(chips.length).toBe(1);
    expect(chips[0].textContent?.trim()).toBe('Lasagna');
  });
});
