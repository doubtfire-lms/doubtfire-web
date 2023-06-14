import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { Unit, TeachingPeriod, User } from 'src/app/api/models/doubtfire-model';

export interface TeachingPeriodUnitImportData {
  teachingPeriod: TeachingPeriod;
}

interface UnitImportData {
  unitCode: string;
  sourceUnit: Unit;
  convenor: User;
}

/**
 * @title Dialog Overview
 * This dialog allows the user to enter a number of units to be rolled over into the a teaching period.
 */
@Component({
  selector: 'f-teaching-period-unit-import',
  templateUrl: 'teaching-period-unit-import.component.html',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatStepperModule],
})
export class TeachingPeriodUnitImportComponent {
  /**
   * The list of unit related data for the import.
   */
  public units: UnitImportData[] = [];

  constructor(
    public dialogRef: MatDialogRef<TeachingPeriodUnitImportData>,
    @Inject(MAT_DIALOG_DATA) public data: TeachingPeriodUnitImportData
  ) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
