import { Component, input } from '@angular/core';
import { MealResponse, UnitOfMeasurement } from '../../api/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-view-meal',
  imports: [RouterLink],
  templateUrl: './view-meal.html',
  styleUrl: './view-meal.scss',
})
export class ViewMeal {
  protected readonly meal = input.required<MealResponse>();
  protected readonly UnitOfMeasurement = UnitOfMeasurement;
}
