import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { TaskDefinitionService } from 'src/app/api/services/task-definition.service';
import { AlertService } from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-unit-task-editor',
  templateUrl: 'unit-task-editor.component.html',
  styleUrls: ['unit-task-editor.component.scss'],
})
export class UnitTaskEditorComponent implements AfterViewInit {
  @ViewChild(MatTable, { static: false }) table: MatTable<TaskDefinition>;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  @Input() unit: Unit;

  public taskDefinitionSource: MatTableDataSource<TaskDefinition>;
  public columns: string[] = ['name'];
  public filter: string;
  public selectedTaskDefinition: TaskDefinition;

  constructor(private taskDefinitionService: TaskDefinitionService, private alerts: AlertService) {}

  ngAfterViewInit(): void {
    this.subscriptions.push(
      this.unit.taskDefinitionCache.values.subscribe(
        (taskDefinitions) => {
          this.taskDefinitionSource = new MatTableDataSource<TaskDefinition>(taskDefinitions);
          this.taskDefinitionSource.paginator = this.paginator;
          this.taskDefinitionSource.sort = this.sort;
          this.taskDefinitionSource.filterPredicate = (data: any, filter: string) => data.matches(filter);
        }
      )
    );
  }

  private subscriptions: Subscription[] = [];
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public selectTaskDefinition(taskDefinition: TaskDefinition) {
    if (this.selectedTaskDefinition === taskDefinition) {
      this.selectedTaskDefinition = null;
    } else {
      this.selectedTaskDefinition = taskDefinition;
    }
  }

  public sortData(sort: Sort) {
    const data = this.taskDefinitionSource.data;

    if (!sort.active || sort.direction === '') {
      this.taskDefinitionSource.data = data;
      return;
    }

    this.taskDefinitionSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.abbreviation, b.abbreviation, isAsc);
        default: return 0;
      }
    });
  }

  public compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  applyFilter(filterValue: string) {
    this.taskDefinitionSource.filter = filterValue.trim().toLowerCase();

    this.selectedTaskDefinition = null;

    if (this.taskDefinitionSource.paginator) {
      this.taskDefinitionSource.paginator.firstPage();
    }
  }

  public matchCsvFiles(file: File): boolean {
    return file.type === 'text/csv';
  }

  public matchZipFiles(file: File): boolean {
    return file.type === 'application/zip';
  }

  public uploadTaskDefinitions(file: FileList) {

  }

  public uploadTaskPdfs(file: FileList) {

  }

  public downloadTaskDefinitions() {
  }

  public downladTaskDefinitionsZip() {
  }


}
