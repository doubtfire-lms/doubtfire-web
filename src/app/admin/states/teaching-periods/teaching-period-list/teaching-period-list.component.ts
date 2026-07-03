import {AsyncPipe, DatePipe, NgTemplateOutlet} from '@angular/common';
import {ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {
  MatDateRangeInput,
  MatDateRangePicker,
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatList, MatListItem, MatListItemLine, MatListItemTitle} from '@angular/material/list';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {Observable} from 'rxjs';
import {TeachingPeriodBreak} from 'src/app/api/models/teaching-period';
import {TeachingPeriod} from 'src/app/api/models/teaching-period';
import {TeachingPeriodBreakService} from 'src/app/api/services/teaching-period-break.service';
import {TeachingPeriodService} from 'src/app/api/services/teaching-period.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {TeachingPeriodUnitImportService} from '../teaching-period-unit-import/teaching-period-unit-import.dialog';

@Component({
  selector: 'f-teaching-period-list',
  templateUrl: './teaching-period-list.component.html',
  styleUrls: ['./teaching-period-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatButton,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatCheckbox,
    MatSortHeader,
    MatIconButton,
    MatIcon,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    DatePipe,
  ],
})
export class TeachingPeriodListComponent implements OnInit {
  @ViewChild(MatSort) sort = new MatSort();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource: MatTableDataSource<TeachingPeriod> = new MatTableDataSource();

  displayedColumns: string[] = ['active', 'name', 'startDate', 'endDate', 'activeUntil', 'actions'];

  constructor(
    private teachingPeriodsService: TeachingPeriodService,
    public dialog: MatDialog,
    public teachingPeriodUnitImportService: TeachingPeriodUnitImportService,
  ) {}

  ngOnInit(): void {
    // update the Teaching Periods
    this.teachingPeriodsService.query().subscribe();

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
      this.dialog.open(NewTeachingPeriodDialogComponent, {data: {teachingPeriod: teachingPeriod}});
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatTabGroup,
    MatTab,
    NgTemplateOutlet,
    MatButton,
    MatDialogClose,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDatepickerToggle,
    MatSuffix,
    MatDateRangePicker,
    MatDatepickerInput,
    MatHint,
    MatDatepicker,
    MatList,
    MatListItem,
    MatListItemTitle,
    MatListItemLine,
    MatIconButton,
    MatIcon,
    AsyncPipe,
    DatePipe,
  ],
})
export class NewTeachingPeriodDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<NewTeachingPeriodDialogComponent>,
    public teachingPeriodService: TeachingPeriodService,
    public teachingPeriodBreakService: TeachingPeriodBreakService,
    public alertService: AlertService,
  ) {}
  public newOrSelectedTeachingPeriod: TeachingPeriod =
    this.data.teachingPeriod || new TeachingPeriod();
  public teachingBreaks$: Observable<TeachingPeriodBreak[]> = this.newOrSelectedTeachingPeriod
    .breaksCache.values as Observable<TeachingPeriodBreak[]>;

  public tempBreak = new TeachingPeriodBreak();

  addTeachingBreak() {
    this.newOrSelectedTeachingPeriod
      .addBreak(this.tempBreak.startDate, this.tempBreak.numberOfWeeks)
      .subscribe({
        next: (teachingPeriodBreak) => {
          this.alertService.success('Break added');
          console.log(teachingPeriodBreak);
        },
        error: (response) => {
          this.alertService.error(`Error adding break. ${response}`);
        },
      });
  }

  deleteBreak(teachingPeriod: TeachingPeriod, teachingBreak: TeachingPeriodBreak): void {
    teachingPeriod.removeBreak(teachingBreak.id).subscribe({
      next: (teachingPeriodBreak) => {
        console.log(teachingPeriodBreak);
      },
      error: (response) => {
        this.alertService.error(`Error deleting break. ${response}`);
      },
    });
  }

  submitTeachingPeriod() {
    // Check if we are updating or creating a new teaching period
    const observer = this.newOrSelectedTeachingPeriod.id
      ? this.teachingPeriodService.update(this.newOrSelectedTeachingPeriod)
      : this.teachingPeriodService.store(this.newOrSelectedTeachingPeriod);

    // Save the teaching period
    observer.subscribe({
      next: (teachingPeriod) => {
        this.alertService.success(`${teachingPeriod.name} saved`);
        this.dialogRef.close(teachingPeriod);
      },
      error: (response) => {
        this.alertService.error(`Error saving teaching period. ${response}`);
      },
    });
  }
}
