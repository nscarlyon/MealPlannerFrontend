import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';

import { HasUnsavedChanges, unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  let dialogMock: { open: ReturnType<typeof vi.fn> };

  const runGuard = (component: HasUnsavedChanges) =>
    TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(
        component,
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

  const dialogReturns = (result: boolean | undefined) =>
    dialogMock.open.mockReturnValue({ afterClosed: () => of(result) });

  beforeEach(() => {
    dialogMock = { open: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: dialogMock }],
    });
  });

  it('allows navigation without prompting when there are no unsaved changes', () => {
    expect(runGuard({ hasUnsavedChanges: () => false })).toBe(true);
    expect(dialogMock.open).not.toHaveBeenCalled();
  });

  it('allows navigation when the user confirms', async () => {
    dialogReturns(true);
    const result = runGuard({ hasUnsavedChanges: () => true }) as Observable<boolean>;
    expect(await firstValueFrom(result)).toBe(true);
  });

  it('blocks navigation when the user cancels or dismisses the dialog', async () => {
    dialogReturns(false);
    let result = runGuard({ hasUnsavedChanges: () => true }) as Observable<boolean>;
    expect(await firstValueFrom(result)).toBe(false);

    dialogReturns(undefined);
    result = runGuard({ hasUnsavedChanges: () => true }) as Observable<boolean>;
    expect(await firstValueFrom(result)).toBe(false);
  });
});
