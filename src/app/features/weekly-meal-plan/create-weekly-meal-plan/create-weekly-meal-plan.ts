import {
  Component,
  computed,
  inject,
  linkedSignal,
  PendingTasks,
  resource,
  signal,
} from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { MatBadge } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatChip, MatChipRemove, MatChipSet } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { MealsService } from '../../../api/generated/meals/meals.service';
import { WeeklyMealPlanService } from '../../../api/generated/weekly-meal-plan/weekly-meal-plan.service';
import {
  MealPlanItemRequest,
  PaginatedMeal,
  WeeklyMealPlanRequest,
} from '../../../api/models';
import { HasUnsavedChanges } from '../../../guards/unsaved-changes.guard';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';
import { InViewport } from '../../../shared/in-viewport/in-viewport.directive';
import { DateHelper } from '../DateHelper';
import { DayPill, DayPillHelper } from '../day-pill';
import { DragAndDropDay, DragAndDropMealItem } from '../drag-and-drop-meal-item';
import { DailyMealPlanItem } from '../view-weekly-meal-plan/daily-meal-plan-item';
import { ViewWeeklyMealPlan } from '../view-weekly-meal-plan/view-weekly-meal-plan';
import { arePlansDifferent, bySortOrder, toItemRequests } from './create-weekly-meal-helpers';


@Component({
  selector: 'app-create-weekly-meal-plan',
  imports: [
    MatCardModule,
    CdkDropList,
    CdkDrag,
    MatBadge,
    MatChipSet,
    MatChip,
    MatChipRemove,
    MatIcon,
    ViewWeeklyMealPlan,
    InViewport,
  ],
  templateUrl: './create-weekly-meal-plan.html',
  styleUrl: './create-weekly-meal-plan.scss',
  host: {
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class CreateWeeklyMealPlan implements HasUnsavedChanges {
  private readonly weeklyMealPlanService = inject(WeeklyMealPlanService);
  private readonly mealService = inject(MealsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly pendingTasks = inject(PendingTasks);

  readonly currentMonday = signal<Date>(DateHelper.getMondayFromToday(new Date()));
  readonly isSaving = signal(false);

  private readonly weekStartDate = computed(() =>
    DateHelper.getFormattedDate(this.currentMonday()),
  );

  private readonly availableMeals = signal<PaginatedMeal[]>([]);
  private readonly lastLoadedMealsPage = signal(0);
  private readonly totalMealPages = signal<number | undefined>(undefined);
  protected readonly isLoadingMeals = signal(false);
  private readonly mealsLoadFailed = signal(false);

  protected readonly hasMoreMeals = computed(() => {
    const total = this.totalMealPages();
    return total === undefined || this.lastLoadedMealsPage() < total;
  });

  readonly weeklyMealPlanResource = resource({
    params: () => this.weekStartDate(),
    loader: async ({ params }) => {
      try {
        return await firstValueFrom(
          this.weeklyMealPlanService.getApiWeeklyMealPlanStartDate(params),
        );
      } catch (err) {
        // 404 means no plan exists for this week yet; anything else is a real failure.
        if (err instanceof HttpErrorResponse && err.status === HttpStatusCode.NotFound) {
          return undefined;
        }
        throw err;
      }
    },
  });

  private readonly isPlanLoaded = computed(
    () => !this.weeklyMealPlanResource.isLoading() && !this.weeklyMealPlanResource.error(),
  );

  protected readonly loadErrorMessage = computed(() => {
    if (this.mealsLoadFailed()) return "Couldn't load your meals.";
    if (this.weeklyMealPlanResource.error()) return "Couldn't load this week's meal plan.";
    return null;
  });

  private readonly loadedWeek = computed(() => ({
    week: this.weekStartDate(),
    plan: this.weeklyMealPlanResource.hasValue() ? this.weeklyMealPlanResource.value() : undefined,
  }));

  readonly loadedPlanId = linkedSignal({
    source: this.loadedWeek,
    computation: ({ plan }): string | undefined => plan?.id,
  });

  private readonly originalPlanItems = linkedSignal({
    source: this.loadedWeek,
    computation: ({ plan }) => toItemRequests(plan),
  });

  readonly editablePlanItems = linkedSignal(() => this.originalPlanItems());

  readonly hasUnsavedChanges = computed(() =>
    arePlansDifferent(this.editablePlanItems(), this.originalPlanItems()),
  );

  readonly dayPills = computed<DayPill[]>(() => {
    const items = this.editablePlanItems();
    return DayPillHelper.getDayPills(this.currentMonday()).map((pill) => {
      const date = DateHelper.getFormattedDate(pill.date);
      return { ...pill, numberOfMeals: items.filter((item) => item.date === date).length };
    });
  });
  private readonly pillsByDate = computed(
    () => new Map(this.dayPills().map((pill) => [DateHelper.getFormattedDate(pill.date), pill])),
  );
  readonly mealIds = computed(() => this.availableMeals().map((meal) => meal.id));
  readonly meals = computed<DragAndDropMealItem[]>(() => {
    const items = this.editablePlanItems();
    const pillsByDate = this.pillsByDate();

    return this.availableMeals().map((meal) => ({
      mealId: meal.id,
      name: meal.name,
      type: meal.type,
      cuisine: meal.cuisine,
      assignedDays: items
        .filter((item) => item.mealId === meal.id)
        .map((item): DragAndDropDay => {
          const pill = pillsByDate.get(item.date);
          return {
            dayOfWeekLabel: pill?.label ?? item.day.substring(0, 2),
            planDate: item.date,
            sortOrder: item.sortOrder,
            className: pill?.className ?? 'pill-default',
          };
        })
        .sort((a, b) => a.planDate.localeCompare(b.planDate)),
    }));
  });

  // ToDo Move to viewWeeklyMeals? mealNames & weeklyMeals?
  private readonly mealNames = computed(() => {
    const names = new Map<string, string>();
    for (const item of this.loadedWeek()?.plan?.items ?? []) names.set(item.mealId, item.meal.name);
    for (const meal of this.availableMeals()) names.set(meal.id, meal.name);
    return names;
  });

  readonly weeklyMeals = computed<DailyMealPlanItem[]>(() => {
    const names = this.mealNames();
    return [...this.editablePlanItems()].sort(bySortOrder).map((item) => ({
      day: item.day,
      date: DateHelper.parseDate(item.date),
      mealName: names.get(item.mealId) ?? 'Unknown meal',
      sortOrder: item.sortOrder,
    }));
  });

  constructor() {
    void this.loadMoreMeals();
  }

  protected onListEndVisibilityChange(visible: boolean): void {
    if (visible) void this.loadMoreMeals();
  }

  protected async loadMoreMeals(): Promise<void> {
    if (this.isLoadingMeals() || this.mealsLoadFailed() || !this.hasMoreMeals()) return;

    const page = this.lastLoadedMealsPage() + 1;
    this.isLoadingMeals.set(true);
    const removePendingTask = this.pendingTasks.add();
    try {
      const response = await firstValueFrom(
        this.mealService.getApiMeals({ PageNumber: page, PageSize: 20 }),
      );
      this.availableMeals.update((loaded) => {
        const loadedIds = new Set(loaded.map((meal) => meal.id));
        return [...loaded, ...response.meals.filter((meal) => !loadedIds.has(meal.id))];
      });
      this.lastLoadedMealsPage.set(page);
      this.totalMealPages.set(response.totalPages ?? page);
    } catch (err) {
      console.error('Failed to load meals:', err);
      this.mealsLoadFailed.set(true);
    } finally {
      this.isLoadingMeals.set(false);
      removePendingTask();
    }
  }

  protected retryLoad(): void {
    if (this.mealsLoadFailed()) {
      this.mealsLoadFailed.set(false);
      void this.loadMoreMeals();
    }
    if (this.weeklyMealPlanResource.error()) this.weeklyMealPlanResource.reload();
  }

  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.hasUnsavedChanges()) return;
    event.preventDefault();
    // Legacy browsers require returnValue to be set; modern ones ignore the text.
    event.returnValue = '';
  }

  protected onWeekChange(monday: Date): void {
    if (!this.hasUnsavedChanges()) {
      this.currentMonday.set(monday);
      return;
    }

    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        data: {
          title: 'Discard unsaved changes?',
          message:
            "You have unsaved changes to this week's meal plan. If you switch weeks, they will be lost.",
          confirmLabel: 'Discard and switch',
          cancelLabel: 'Stay on this week',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.currentMonday.set(monday);
      });
  }

  protected onMealListDropped(event: CdkDragDrop<DragAndDropMealItem, DayPill[], DayPill>): void {
    if (!this.isPlanLoaded()) return;

    const dayPill = event.item.data;
    const mealId = event.container.data.mealId;
    const date = DateHelper.getFormattedDate(dayPill.date);

    this.editablePlanItems.update((items) => {
      const sameDay = items.filter((item) => item.date === date);
      // A meal only needs to be planned once per day.
      if (sameDay.some((item) => item.mealId === mealId)) return items;
      return [...items, { mealId, day: dayPill.name, date, sortOrder: sameDay.length }];
    });
  }

  protected removeDayChip(mealId: string, day: DragAndDropDay): void {
    this.editablePlanItems.update((items) => {
      const remaining = items.filter(
        (item) => !(item.mealId === mealId && item.date === day.planDate),
      );
      if (remaining.length === items.length) return items;

      // Re-number the remaining meals on that day so sortOrder stays contiguous.
      const sameDay = remaining.filter((item) => item.date === day.planDate).sort(bySortOrder);
      return remaining.map((item) =>
        item.date === day.planDate ? { ...item, sortOrder: sameDay.indexOf(item) } : item,
      );
    });
  }

  protected async onSavePlan(): Promise<void> {
    if (this.isSaving() || !this.isPlanLoaded()) return;

    const weekStartDate = this.weekStartDate();
    const items = this.editablePlanItems();
    const payload: WeeklyMealPlanRequest = { weekStartDate, items };
    const isStillOnWeek = () => this.weekStartDate() === weekStartDate;

    this.isSaving.set(true);
    try {
      const id = this.loadedPlanId();
      if (id) {
        await firstValueFrom(this.weeklyMealPlanService.putApiWeeklyMealPlanId(id, payload));
      } else {
        const created = await firstValueFrom(
          this.weeklyMealPlanService.postApiWeeklyMealPlan(payload),
        );
        if (created?.id && isStillOnWeek()) this.loadedPlanId.set(created.id);
      }

      if (isStillOnWeek()) this.markSaved(items);
    } catch (err) {
      console.error('Failed to save meal plan:', err);
      this.snackBar.open("Couldn't save your meal plan. Please try again.", 'Close', {
        duration: 5000,
      });
    } finally {
      this.isSaving.set(false);
    }
  }

  private markSaved(items: MealPlanItemRequest[]): void {
    const current = this.editablePlanItems();
    this.originalPlanItems.set(items);
    this.editablePlanItems.set(current);
  }
}
