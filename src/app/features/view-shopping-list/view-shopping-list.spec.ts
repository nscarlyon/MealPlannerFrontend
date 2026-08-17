import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShoppingList } from './view-shopping-list';

describe('ViewShoppingList', () => {
  let component: ViewShoppingList;
  let fixture: ComponentFixture<ViewShoppingList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewShoppingList],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewShoppingList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
