import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealsSearchBar } from './meals-search-bar';
import { MealSearchState } from '../states/meal-search-state';

describe('MealsSearchBar', () => {
  let component: MealsSearchBar;
  let fixture: ComponentFixture<MealsSearchBar>;
  let state: MealSearchState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealsSearchBar],
      providers: [MealSearchState],
    }).compileComponents();

    fixture = TestBed.createComponent(MealsSearchBar);
    component = fixture.componentInstance;
    state = TestBed.inject(MealSearchState);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write the trimmed search input to the shared state', () => {
    const event = { target: { value: '  SPAGHETTI  ' } } as unknown as Event;

    component.applyFilter(event);
    expect(state.searchInput()).toBe('SPAGHETTI');
  });
});
