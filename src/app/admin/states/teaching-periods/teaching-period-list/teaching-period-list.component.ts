import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, map } from 'rxjs';
import { TeachingPeriod } from 'src/app/api/models/teaching-period';
import { TeachingPeriodService } from 'src/app/api/services/teaching-period.service';

@Component({
  selector: 'f-teaching-period-list',
  templateUrl: './teaching-period-list.component.html',
  styleUrls: ['./teaching-period-list.component.scss'],
})
export class TeachingPeriodListComponent implements AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  teachingPeriods$: Observable<TeachingPeriod[]>;
  public dataSource: MatTableDataSource<TeachingPeriod>;

  displayedColumns: string[] = ['active', 'name', 'startDate', 'endDate', 'activeUntil'];
  teachingPeriodsAsMatTableDataSource$: Observable<MatTableDataSource<TeachingPeriod>> = this.teachingPeriodsService
    .query()
    .pipe(
      map((teachingPeriods) => {
        this.dataSource = new MatTableDataSource(teachingPeriods);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        return this.dataSource;
      })
    );

  ngAfterViewInit(): void {
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
    // this.teachingPeriodsAsMatTableDataSource$.
    // this.teachingPeriodsService.query().subscribe((teachingPeriods) => {
    //   this.dataSource = new MatTableDataSource(teachingPeriods);
    //   this.dataSource.sort = this.sort;
    //   this.dataSource.paginator = this.paginator;
    // });
  }

  constructor(private teachingPeriodsService: TeachingPeriodService) {}
  selectTeachingPeriod(teachingPeriod: TeachingPeriod) {
    console.log(teachingPeriod);
  }
}
