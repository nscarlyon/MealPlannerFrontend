import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ViewWeeklyMealPlan } from './view-weekly-meal-plan';
import { DateHelper } from '../DateHelper';

describe('ViewWeeklyMealPlan', () => {
  let component: ViewWeeklyMealPlan;
  let fixture: ComponentFixture<ViewWeeklyMealPlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWeeklyMealPlan],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewWeeklyMealPlan);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('weekStartDate', DateHelper.getMondayFromToday(new Date()));
    fixture.componentRef.setInput('weeklyMeals', []);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request a week change without applying it itself', () => {
    const initialMonday = DateHelper.getMondayFromToday(new Date());
    const changeSpy = vi.fn();
    component.weekStartDateChange.subscribe(changeSpy);

    component.shiftWeek(1);

    const nextWeekMonday = new Date(initialMonday);
    nextWeekMonday.setDate(initialMonday.getDate() + 7);
    expect(changeSpy).toHaveBeenCalledTimes(1);
    expect(changeSpy.mock.calls[0][0].toDateString()).toBe(nextWeekMonday.toDateString());
    expect(component.weekStartDate().toDateString()).toBe(initialMonday.toDateString());
  });

  it('should not request a change when Today is clicked on the current week', () => {
    const changeSpy = vi.fn();
    component.weekStartDateChange.subscribe(changeSpy);

    component.goToToday();

    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('should emit save output on save', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    (component as any).onSave();
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });
});
