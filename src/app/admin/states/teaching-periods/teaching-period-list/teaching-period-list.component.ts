import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TeachingPeriodBreak } from 'src/app/api/models/teaching-period';
import { TeachingPeriod } from 'src/app/api/models/teaching-period';
import { TeachingPeriodBreakService } from 'src/app/api/services/teaching-period-break.service';
import { TeachingPeriodService } from 'src/app/api/services/teaching-period.service';
import { TeachingPeriodUnitImportService } from '../teaching-period-unit-import/teaching-period-unit-import.dialog';

@Component({
  selector: 'f-teaching-period-list',
  templateUrl: './teaching-period-list.component.html',
  styleUrls: ['./teaching-period-list.component.scss'],
})
export class TeachingPeriodListComponent implements OnInit {
  @ViewChild(MatSort) sort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource = new MatTableDataSource<TeachingPeriod>();

  displayedColumns: string[] = ['active', 'name', 'startDate', 'endDate', 'activeUntil', 'actions'];

  constructor(
    private teachingPeriodsService: TeachingPeriodService,
    public dialog: MatDialog,
    public teachingPeriodUnitImportService: TeachingPeriodUnitImportService,
  ) {}

  ngOnInit(): void {
    // update the Teaching Periods
    this.teachingPeriodsService.query().subscribe((_) => {});

    // Bind to the Teaching Periods
    this.teachingPeriodsService.cache.values.subscribe((teachingPeriods) => {
      this.dataSource.data = teachingPeriods;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  importUnits(teachingPeriod: TeachingPeriod) {
    this.teachingPeriodUnitImportService.openImportUnitsDialog(teachingPeriod);
  }

  addTeachingPeriod() {
    this.dialog.open(NewTeachingPeriodDialogComponent, {
      data: {},
    });
  }

  selectTeachingPeriod(selectedTeachingPeriod: TeachingPeriod) {
    this.teachingPeriodsService.get(selectedTeachingPeriod.id).subscribe((teachingPeriod) => {
      this.dialog.open(NewTeachingPeriodDialogComponent, { data: { teachingPeriod: teachingPeriod } });
    });
  }

  /**
   * Function used by implemented sortTableData to determine the order
   * of values within the EntityForm once sorting has been triggered.
   *
   * @param aValue value to be compared against bValue.
   * @param bValue value to be compared against aValue.
   *
   * @returns truthy comparison between aValue and bValue.
   */
  protected sortCompare(aValue: number | string, bValue: number | string, isAsc: boolean) {
    return (aValue < bValue ? -1 : 1) * (isAsc ? 1 : -1);
  }

  // Sorting function to sort data when sort
  // event is triggered
  sortTableData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }
    switch (sort.active) {
      case 'active':
      case 'name':
      case 'startDate':
      case 'endDate':
      case 'activeUntil':
        this.dataSource.data = this.dataSource.data.sort((a, b) => {
          const isAsc = sort.direction === 'asc';
          return this.sortCompare(a[sort.active], b[sort.active], isAsc);
        });
        return;
    }
  }
}

@Component({
  selector: 'f-new-teaching-period-dialog',
  templateUrl: 'new-teaching-period-dialog.component.html',
})
export class NewTeachingPeriodDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<NewTeachingPeriodDialogComponent>,
    public teachingPeriodService: TeachingPeriodService,
    public teachingPeriodBreakService: TeachingPeriodBreakService,
    private _snackBar: MatSnackBar
  ) {}
  public newOrSelectedTeachingPeriod = this.data.teachingPeriod || new TeachingPeriod();

  public tempBreak = new TeachingPeriodBreak();

  addTeachingBreak() {
    this.newOrSelectedTeachingPeriod.addBreak(this.tempBreak.startDate, this.tempBreak.numberOfWeeks).subscribe({
      next: (teachingPeriodBreak) => {
        console.log(teachingPeriodBreak);
      },
    });
  }

  deleteBreak(teachingPeriod: TeachingPeriod, teachingBreak: TeachingPeriodBreak): void {
    teachingPeriod.removeBreak(teachingBreak.id).subscribe({
      next: (teachingPeriodBreak) => {
        console.log(teachingPeriodBreak);
      },
      error: (response) => {},
    });
  }

  submitTeachingPeriod() {
    // todo: use alert service
    this.teachingPeriodService.store(this.newOrSelectedTeachingPeriod).subscribe({
      next: (teachingPeriod) => {
        this._snackBar.open(`${teachingPeriod.name} saved`, 'dismiss', {
          duration: 2000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
      error: (response) => {
        this._snackBar.open(response, 'dismiss', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }
}
