import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ViewMeal } from './view-meal';

describe('ViewMeal', () => {
  let component: ViewMeal;
  let fixture: ComponentFixture<ViewMeal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMeal],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewMeal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('meal', {
      id: 'meal-1',
      name: 'Spaghetti Bolognese',
      description: 'Classic pasta',
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
