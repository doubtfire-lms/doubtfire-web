import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Observable} from 'rxjs';
import {Campus} from 'src/app/api/models/campus/campus';
import {TeachingPeriodBreak} from 'src/app/api/models/teaching-period';
import {TeachingPeriod} from 'src/app/api/models/teaching-period';
import {CampusService} from 'src/app/api/services/campus.service';
import {TeachingPeriodBreakService} from 'src/app/api/services/teaching-period-break.service';
import {TeachingPeriodService} from 'src/app/api/services/teaching-period.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {TeachingPeriodUnitImportService} from '../teaching-period-unit-import/teaching-period-unit-import.dialog';

@Component({
  selector: 'f-teaching-period-list',
  templateUrl: './teaching-period-list.component.html',
  styleUrls: ['./teaching-period-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TeachingPeriodListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public dataSource: MatTableDataSource<TeachingPeriod> = new MatTableDataSource();

  displayedColumns: string[] = [
    'active',
    'name',
    'startDate',
    'lastTeachingDate',
    'endDate',
    'activeUntil',
    'actions',
  ];

  constructor(
    private teachingPeriodsService: TeachingPeriodService,
    public dialog: MatDialog,
    public teachingPeriodUnitImportService: TeachingPeriodUnitImportService,
  ) {}

  ngOnInit(): void {
    this.dataSource.sortingDataAccessor = (teachingPeriod, column) => {
      switch (column) {
        case 'active':
          return Number(teachingPeriod.active);
        case 'name':
          return teachingPeriod.name;
        case 'startDate':
        case 'lastTeachingDate':
        case 'endDate':
          return this.sortDateValue(teachingPeriod[column]);
        case 'activeUntil':
          return this.sortDateValue(teachingPeriod.activeUntil);
        default:
          return '';
      }
    };

    // update the Teaching Periods
    this.teachingPeriodsService.query().subscribe();

    // Bind to the Teaching Periods
    this.teachingPeriodsService.cache.values.subscribe((teachingPeriods) => {
      this.dataSource.data = teachingPeriods;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
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

  private sortDateValue(value: Date | string): number {
    const time = new Date(value).getTime();
    return Number.isFinite(time) ? time : 0;
  }
}

@Component({
  selector: 'f-new-teaching-period-dialog',
  templateUrl: 'new-teaching-period-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class NewTeachingPeriodDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<NewTeachingPeriodDialogComponent>,
    public teachingPeriodService: TeachingPeriodService,
    public teachingPeriodBreakService: TeachingPeriodBreakService,
    public campusService: CampusService,
    public alertService: AlertService,
  ) {}
  public newOrSelectedTeachingPeriod: TeachingPeriod =
    this.data.teachingPeriod || new TeachingPeriod();
  public teachingBreaks$: Observable<TeachingPeriodBreak[]> = this.newOrSelectedTeachingPeriod
    .breaksCache.values as Observable<TeachingPeriodBreak[]>;

  public tempBreak = new TeachingPeriodBreak();
  public editingBreak: TeachingPeriodBreak;
  public campuses: Campus[] = [];

  ngOnInit(): void {
    this.campusService.query().subscribe((campuses) => (this.campuses = campuses));
  }

  defaultLastTeachingDate(endDate: Date): void {
    if (!this.newOrSelectedTeachingPeriod.lastTeachingDate) {
      this.newOrSelectedTeachingPeriod.lastTeachingDate = endDate;
    }
  }

  addTeachingBreak() {
    this.newOrSelectedTeachingPeriod
      .addBreak(
        this.tempBreak.startDate,
        this.tempBreak.numberOfDays,
        this.tempBreak.campusIds,
        this.tempBreak.label,
        this.tempBreak.pauseWeekCount,
      )
      .subscribe({
        next: () => {
          this.alertService.success('Break added');
        },
        error: (response) => {
          this.alertService.error(`Error adding break. ${response}`);
        },
      });
  }

  deleteBreak(teachingPeriod: TeachingPeriod, teachingBreak: TeachingPeriodBreak): void {
    teachingPeriod.removeBreak(teachingBreak.id).subscribe({
      error: (response) => {
        this.alertService.error(`Error deleting break. ${response}`);
      },
    });
  }

  editTeachingBreak(teachingBreak: TeachingPeriodBreak): void {
    this.editingBreak = Object.assign(new TeachingPeriodBreak(), teachingBreak, {
      campusIds: [...teachingBreak.campusIds],
    });
  }

  cancelEditingBreak(): void {
    this.editingBreak = undefined;
  }

  saveTeachingBreak(teachingBreak: TeachingPeriodBreak): void {
    this.teachingPeriodBreakService
      .update(
        {
          teaching_period_id: this.newOrSelectedTeachingPeriod.id,
          id: teachingBreak.id,
        },
        {entity: this.editingBreak},
      )
      .subscribe({
        next: (updatedBreak) => {
          Object.assign(teachingBreak, updatedBreak);
          this.editingBreak = undefined;
          this.alertService.success('Break updated');
        },
        error: (response) => {
          this.alertService.error(`Error updating break. ${response}`);
        },
      });
  }

  /**
   * The week count can only be paused by breaks that span whole teaching weeks,
   * so clear the flag whenever the duration is no longer a multiple of 7 days.
   */
  breakDurationChanged(teachingBreak: TeachingPeriodBreak): void {
    if (!teachingBreak.canPauseWeekCount) {
      teachingBreak.pauseWeekCount = false;
    }
  }

  campusName(campusId: number): string {
    return this.campuses.find((campus) => campus.id === campusId)?.name ?? `Campus ${campusId}`;
  }

  campusNames(campusIds: number[]): string {
    return campusIds.map((campusId) => this.campusName(campusId)).join(', ');
  }

  campusSummary(campusIds: number[]): string {
    return campusIds.length ? `Campuses: ${this.campusNames(campusIds)}` : 'All campuses';
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
