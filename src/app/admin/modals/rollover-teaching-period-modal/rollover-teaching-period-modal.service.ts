import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { RolloverTeachingPeriodModalComponent } from './rollover-teaching-period-modal.component';

@Injectable({
  providedIn: 'root',
})
export class RolloverTeachingPeriodModalService {
  constructor(public dialog: MatDialog) {}

  public show(teachingPeriod: any) {
    let dialogRef: MatDialogRef<RolloverTeachingPeriodModalComponent, any>;
    dialogRef = this.dialog.open(RolloverTeachingPeriodModalComponent, {
      data: {
        teachingPeriod,
      },
    });
  }
}
