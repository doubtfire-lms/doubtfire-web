import { Component, Inject, Injectable, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { Unit, TeachingPeriod, User, UserService } from 'src/app/api/models/doubtfire-model';
import { Observable, filter, map, startWith } from 'rxjs';
import { MatTable, MatTableDataSource } from '@angular/material/table';

export interface TeachingPeriodUnitImportData {
  teachingPeriod: TeachingPeriod;
}

interface UnitImportData {
  unitCode: string;
  sourceUnit: Unit;
  convenor: User;
}

@Injectable()
export class TeachingPeriodUnitImportService {
  constructor(public dialog: MatDialog) {}

  openImportUnitsDialog(teachingPeriod: TeachingPeriod): void {
    const dialogRef = this.dialog.open(TeachingPeriodUnitImportDialog, {
      data: {teachingPeriod: teachingPeriod},
    });

    dialogRef.afterClosed().subscribe( () => {
      console.log('The dialog was closed');
    });
  }
}

/**
 * @title Dialog Overview
 * This dialog allows the user to enter a number of units to be rolled over into the a teaching period.
 */
@Component({
  selector: 'f-teaching-period-unit-import',
  templateUrl: 'teaching-period-unit-import.dialog.html'
})
export class TeachingPeriodUnitImportDialog implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  /**
   * The list of unit related data for the import.
   */
  public unitsToRollover: UnitImportData[] = [];

  public dataSource = new MatTableDataSource(this.unitsToRollover);

  public teachingStaff: User[];

  /**
   * A list of the codes to add - or an individual code
   */
  public codesToAdd: string = '';

  public displayedColumns: string[] = ['unitCode', 'sourceUnit', 'convenor', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<TeachingPeriodUnitImportData>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: TeachingPeriodUnitImportData
  ) {}

  ngOnInit(): void {
    // Load all teaching staff
    this.userService.getTutors().subscribe(
      (staff) => { this.teachingStaff = staff; }
    )
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  public filteredTeachingStaff(value: string): User[] {
    const filterValue = value.toLowerCase();

    return this.teachingStaff.filter(staff => staff.matches(filterValue));
  }

  public addUnitsByCode() {
    const codes = this.codesToAdd.split(',').map(code => code.trim());
    for (const code of codes) {
      this.unitsToRollover.push({
        unitCode: code,
        sourceUnit: null,
        convenor: null,
      });
    }

    this.table.renderRows();
  }
}
