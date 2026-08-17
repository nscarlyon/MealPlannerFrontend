import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs';

import { ConfirmDialog, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) return true;

  return inject(MatDialog)
    .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Discard unsaved changes?',
        message: 'You have unsaved changes. If you leave this page, they will be lost.',
        confirmLabel: 'Discard and leave',
        cancelLabel: 'Stay on this page',
      },
    })
    .afterClosed()
    .pipe(map((confirmed) => confirmed === true));
};
