import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TeachingPeriodBreak } from 'src/app/api/models/teaching-period';
import { TeachingPeriod } from 'src/app/api/models/teaching-period';
import { TeachingPeriodBreakService } from 'src/app/api/services/teaching-period-break.service';
import { TeachingPeriodService } from 'src/app/api/services/teaching-period.service';

@Component({
  selector: 'f-teaching-period-list',
  templateUrl: './teaching-period-list.component.html',
  styleUrls: ['./teaching-period-list.component.scss'],
})
export class TeachingPeriodListComponent implements OnInit {
  @ViewChild(MatSort) sort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource = new MatTableDataSource<TeachingPeriod>();

  displayedColumns: string[] = ['active', 'name', 'startDate', 'endDate', 'activeUntil'];
  constructor(private teachingPeriodsService: TeachingPeriodService, public dialog: MatDialog) {}

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
