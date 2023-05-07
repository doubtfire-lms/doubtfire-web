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
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource = new MatTableDataSource<TeachingPeriod>();

  displayedColumns: string[] = ['active', 'name', 'startDate', 'endDate', 'activeUntil'];
  constructor(private teachingPeriodsService: TeachingPeriodService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.teachingPeriodsService.query().subscribe((teachingPeriods) => {
      this.dataSource.data = teachingPeriods;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  addTeachingPeriod() {
    this.dialog.open(NewTeachingPeriodDialogComponent, {
      data: {
        refresh: this.refresh.bind(this),
      },
    });
  }

  selectTeachingPeriod(teachingPeriod: TeachingPeriod) {
    let data: any = { refresh: this.refresh.bind(this) };

    this.teachingPeriodsService.get(teachingPeriod.id).subscribe((teachingPeriod) => {
      data.teachingPeriod = teachingPeriod;
      data.teachingPeriod.startDate = new Date(teachingPeriod.startDate);
      data.teachingPeriod.endDate = new Date(teachingPeriod.endDate);
      this.dialog.open(NewTeachingPeriodDialogComponent, { data });
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
  ) {
    console.log(this.newTeachingPeriod.breaks);
    this.newTeachingPeriod.breaks.map((teachingPeriodBreak) => {
      console.log(teachingPeriodBreak);
      teachingPeriodBreak.startDate = teachingPeriodBreak.originalJson.startDate;
      teachingPeriodBreak.numberOfWeeks = teachingPeriodBreak.originalJson.numberOfWeeks;
      return teachingPeriodBreak;
    });
  }
  public newTeachingPeriod = this.teachingPeriodService.buildInstance(this.data.teachingPeriod || {});

  public break = this.teachingPeriodBreakService.buildInstance({});

  addTeachingBreak() {
    this.newTeachingPeriod.addBreak(new Date(this.break.startDate), this.break.numberOfWeeks).subscribe({
      next: (teachingPeriodBreak) => {
        console.log(teachingPeriodBreak);
      },
    });
  }

  submitTeachingPeriod() {
    this.teachingPeriodService.store(this.newTeachingPeriod).subscribe({
      next: (teachingPeriod) => {
        this.dialogRef.close();
        this._snackBar.open(`${teachingPeriod.name} saved`, 'dismiss', {
          duration: 2000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        this.data.refresh();
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
