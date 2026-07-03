import {DatePipe} from '@angular/common';
import {AfterViewInit, ChangeDetectionStrategy, Component, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconButton} from '@angular/material/button';
import {MatFormField} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import {TiiAction} from 'src/app/api/models/doubtfire-model';
import {TiiActionService} from 'src/app/api/services/tii-action.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-tii-action-log',
  templateUrl: './tii-action-log.component.html',
  styleUrls: ['./tii-action-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormField,
    MatInput,
    FormsModule,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatIcon,
    MatFooterCellDef,
    MatFooterCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    DatePipe,
  ],
})
export class TiiActionLogComponent implements AfterViewInit {
  @ViewChild(MatTable, {static: false}) table: MatTable<TiiAction>;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  public tiiActionsSource: MatTableDataSource<TiiAction>;
  public selectedTaskDefinition: TiiAction | null = null;
  public columns: string[] = [
    'type',
    'lastRun',
    'retries',
    'retry',
    'errorMessage',
    'tiiActionTools',
  ]; //, 'complete', 'retries', 'lastRun', 'errorCode', 'log', 'tiiActionAction'];
  public filter: string;

  constructor(
    private tiiActionService: TiiActionService,
    private alertService: AlertService,
  ) {}

  ngAfterViewInit(): void {
    this.tiiActionService.query().subscribe((actions) => {
      console.log(actions);
      this.tiiActionsSource = new MatTableDataSource<TiiAction>(actions);
      this.tiiActionsSource.paginator = this.paginator;
      this.tiiActionsSource.sort = this.sort;
      this.tiiActionsSource.filterPredicate = (
        data: TiiAction & {matches(filter: string): boolean},
        filter: string,
      ) => data.matches(filter);
    });
  }

  public sortData(sort: Sort) {
    const data = this.tiiActionsSource.data;

    if (!sort.active || sort.direction === '') {
      this.tiiActionsSource.data = data;
      return;
    }

    this.tiiActionsSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'type':
          return this.compare(a.type, b.type, isAsc);
        default:
          return 0;
      }
    });
  }

  public compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  applyFilter(filterValue: string) {
    this.tiiActionsSource.filter = filterValue.trim().toLowerCase();

    if (this.tiiActionsSource.paginator) {
      this.tiiActionsSource.paginator.firstPage();
    }
  }

  public retryAction(action: TiiAction) {
    this.tiiActionService
      .put(action, {
        body: {
          action: 'retry',
        },
      })
      .subscribe({
        next: () => {
          action.retry = true;
          this.alertService.success('Action has been queued for retry');
        },
        error: (error) => {
          this.alertService.error(`Failed to queue action for retry: ${error}`);
        },
      });
  }
}
