import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  CuisineType,
  MealIngredient,
  MealRequest,
  MealType,
  UnitOfMeasurement,
} from '../../api/models';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MealsService } from '../../api/generated/meals/meals.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize, firstValueFrom, map } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChip, MatChipRemove, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-create-meal',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIcon,
    MatStep,
    ReactiveFormsModule,
    MatStepLabel,
    MatStepper,
    MatStepperNext,
    MatStepperPrevious,
    MatChipSet,
    MatChip,
    MatChipRemove,
  ],
  templateUrl: './create-meal.html',
  styleUrl: './create-meal.scss',
})
export class CreateMeal {
  private fb = inject(NonNullableFormBuilder);
  private snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mealService = inject(MealsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly mealTypes = Object.values(MealType);
  protected readonly cuisineTypes = Object.values(CuisineType);
  protected readonly unitOfMeasurements = Object.values(UnitOfMeasurement);
  protected readonly UnitOfMeasurement = UnitOfMeasurement;
  protected readonly ingredients = signal<MealIngredient[]>([]);

  readonly mealId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? undefined)),
  );
  protected readonly isEditMode = computed(() => !!this.mealId());
  protected readonly isSaving = signal(false);

  protected readonly firstFormStep = this.fb.group({
    mealName: ['', Validators.required, Validators.maxLength(100)],
    mealDescription: [''],
  });
  protected readonly secondFormStep = this.fb.group({
    mealType: [MealType.Dinner, Validators.required],
    cuisine: [CuisineType.None, Validators.required],
    numberOfServings: [2, Validators.required],
  });

  protected readonly thirdFormStep = this.fb.group({
    ingredientName: ['', Validators.required, this.uniqueIngredientName()],
    quantity: [0, Validators.required],
    unit: [UnitOfMeasurement.None],
  });

  readonly mealResponse = resource({
    params: () => this.mealId(),
    loader: async ({ params }) => {
      if (!params) {
        return undefined;
      }

      return firstValueFrom(this.mealService.getApiMealsId(params));
    },
  });

  private readonly mealEffect = effect(() => {
    const meal = this.mealResponse.value();
    if (!meal) return;

    untracked(() => {
      this.firstFormStep.patchValue({
        mealName: meal.name,
        mealDescription: meal.description ?? '',
      });
      this.secondFormStep.patchValue({
        numberOfServings: meal.numberOfServings,
        mealType: meal.type,
        cuisine: meal.cuisine,
      });
      this.ingredients.set(meal.ingredients ?? []);
    });
  });

  protected onSubmit() {
    if (this.isSaving()) return;
    const id = this.mealId();
    const request = this.buildRequest();
    const request$ = id
      ? this.mealService.putApiMealsId(id, request)
      : this.mealService.postApiMeals(request);

    this.isSaving.set(true);
    request$
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          const targetId = id ?? response?.id;
          if (!targetId) {
            this.notify(this.failureMessage());
            return;
          }
          this.notify(
            this.isEditMode() ? 'Meal updated successfully' : 'Meal created successfully',
          );
          void this.router.navigate(['/meals', targetId]);
        },
        error: () => this.notify(this.failureMessage()),
      });
  }

  protected addIngredient() {
    if (!this.thirdFormStep.valid) {
      return;
    }

    const ingredientFormData = this.thirdFormStep.getRawValue();
    const mealIngredient: MealIngredient = {
      name: ingredientFormData.ingredientName.trim(),
      quantity: ingredientFormData.quantity,
      unit: ingredientFormData.unit,
    };
    this.ingredients.update((current) => [...current, mealIngredient]);
  }

  protected removeIngredient(ingredient: MealIngredient) {
    this.ingredients.update((current) => current.filter((i) => i !== ingredient));
  }

  private buildRequest(): MealRequest {
    const firstStep = this.firstFormStep.getRawValue();
    const secondStep = this.secondFormStep.getRawValue();
    const ingredients = this.ingredients();

    return {
      name: firstStep.mealName.trim() ?? '',
      description: firstStep.mealDescription.trim() || undefined,
      numberOfServings: secondStep.numberOfServings as number,
      type: secondStep.mealType as MealType,
      cuisine: secondStep.cuisine as CuisineType,
      ingredients: ingredients,
    };
  }

  private uniqueIngredientName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '')
        .trim()
        .toLowerCase();
      if (!value) return null;
      const exists = this.ingredients().some((i) => i.name.trim().toLowerCase() === value);
      return exists ? { duplicateIngredient: true } : null;
    };
  }

  private failureMessage(): string {
    return this.isEditMode() ? 'Meal update failed' : 'Meal creation failed';
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
