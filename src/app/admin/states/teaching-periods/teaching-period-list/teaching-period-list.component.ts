import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, map } from 'rxjs';
import { TeachingPeriod } from 'src/app/api/models/teaching-period';
import { TeachingPeriodService } from 'src/app/api/services/teaching-period.service';

@Component({
  selector: 'f-teaching-period-list',
  templateUrl: './teaching-period-list.component.html',
  styleUrls: ['./teaching-period-list.component.scss'],
})
export class TeachingPeriodListComponent {
  teachingPeriods$: Observable<TeachingPeriod[]>;
  private dataSource = new MatTableDataSource<TeachingPeriod>();
  displayedColumns: string[] = ['active', 'name', 'startDate', 'endDate', 'activeUntil'];
  TeachingPeriodsAsMatTableDataSource$: Observable<MatTableDataSource<TeachingPeriod>> = this.teachingPeriodsService
    .query()
    .pipe(
      map((teachingPeriods) => {
        const dataSource = this.dataSource;
        dataSource.data = teachingPeriods;
        return dataSource;
      })
    );

  constructor(private teachingPeriodsService: TeachingPeriodService) {}

  selectTeachingPeriod(teachingPeriod: TeachingPeriod) {
    console.log(teachingPeriod);
  }
}
