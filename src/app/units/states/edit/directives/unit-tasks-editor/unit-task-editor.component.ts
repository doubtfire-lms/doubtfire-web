import { AfterViewInit, Component, Inject, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { confirmationModal, csvResultModalService, csvUploadModalService } from 'src/app/ajs-upgraded-providers';
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
  public columns: string[] = ['name', 'grade', 'startDate', 'targetDate', 'deadlineDate', 'taskDefAction'];
  public filter: string;
  public selectedTaskDefinition: TaskDefinition;

  constructor(
    private taskDefinitionService: TaskDefinitionService,
    private alerts: AlertService,
    @Inject(csvResultModalService) private csvResultModalService: any,
    @Inject(csvUploadModalService) private csvUploadModal: any,
    @Inject(confirmationModal) private confirmationModal: any
  ) {}

  ngAfterViewInit(): void {
    this.subscriptions.push(
      this.unit.taskDefinitionCache.values.subscribe((taskDefinitions) => {
        this.taskDefinitionSource = new MatTableDataSource<TaskDefinition>(taskDefinitions);
        this.taskDefinitionSource.paginator = this.paginator;
        this.taskDefinitionSource.sort = this.sort;
        this.taskDefinitionSource.filterPredicate = (data: any, filter: string) => data.matches(filter);
      })
    );
  }

  public saveTaskDefinition(taskDefinition: TaskDefinition) {
    taskDefinition.save().subscribe(() => {
      this.alerts.success('Task Saved');
      taskDefinition.setOriginalSaveData(this.taskDefinitionService.mapping);
    });
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

      this.selectedTaskDefinition.setOriginalSaveData(this.taskDefinitionService.mapping);
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
        case 'name':
          return this.compare(a.abbreviation, b.abbreviation, isAsc);
        case 'grade':
          return this.compare(a.targetGrade, b.targetGrade, isAsc);
        case 'startDate':
          return this.compare(a.startDate.getTime(), b.startDate.getTime(), isAsc);
        case 'targetDate':
          return this.compare(a.targetDate.getTime(), b.targetDate.getTime(), isAsc);
        case 'deadlineDate':
          return this.compare(a.dueDate.getTime(), b.dueDate.getTime(), isAsc);
        default:
          return 0;
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

  private guessTaskAbbreviation() {
    if (this.unit.taskDefinitions.length == 0) {
      return '1.1P';
    } else {
      const lastAbbr = this.unit.taskDefinitions[this.unit.taskDefinitions.length - 1].abbreviation;
      const regex = /(.*)(\d+)(\D*)/;
      const match = regex.exec(lastAbbr);
      if (match) {
        return `${match[1]}${parseInt(match[2]) + 1}${match[3]}`;
      } else {
        return `${lastAbbr}1`;
      }
    }
  }

  public taskDefinitionHasChanges(taskDefinition: TaskDefinition): boolean {
    return taskDefinition.hasChanges(this.taskDefinitionService.mapping);
  }

  public deleteTaskDefinition(taskDefinition: TaskDefinition) {
    this.confirmationModal.show(
      `Delete Task ${taskDefinition.abbreviation}`,
      'Are you sure you want to delete this task? This action is final and will delete student work associated with this task.',
      () => {
        this.unit.deleteTaskDefinition(taskDefinition);
        //TODO: reinstate ProgressModal.show "Deleting Task #{task.abbreviation}", 'Please wait while student projects are updated.', promise

        this.alerts.success('Task deleted');
      }
    );
  }

  public uploadTaskDefinitionsCsv() {
    this.csvUploadModal.show(
      'Upload Task Definitions as CSV',
      'Test message',
      { file: { name: 'Task Definition CSV Data', type: 'csv' } },
      this.unit.getTaskDefinitionBatchUploadUrl(),
      (response: any) => {
        // at least one student?
        this.csvResultModalService.show('Task Definition Import Results', response);
        if (response.success.length > 0) {
          this.unit.refresh();
        }
      }
    );
  }

  public uploadTaskResourcesZip() {
    this.csvUploadModal.show(
      'Upload Task Sheets and Resources as Zip',
      'Test message',
      { file: { name: 'Task Sheets and Resources', type: 'zip' } },
      this.unit.taskUploadUrl,
      (response: any) => {
        // at least one student?
        this.csvResultModalService.show('Task Sheet and Resources Import Results', response);
        if (response.success.length > 0) {
          this.unit.refresh();
        }
      }
    );
  }

  public createTaskDefinition() {
    const abbr = this.guessTaskAbbreviation();
    const task = new TaskDefinition(this.unit);

    task.name = `Task ${abbr}`;
    task.abbreviation = abbr;
    task.description = 'New Description';
    task.startDate = new Date();
    task.targetDate = new Date();
    task.uploadRequirements = [];
    task.plagiarismChecks = [];
    task.weighting = 4;
    task.targetGrade = 0;
    task.restrictStatusUpdates = false;
    task.plagiarismWarnPct = 80;
    task.isGraded = false;
    task.maxQualityPts = 0;
    task.tutorialStream = this.unit.tutorialStreams[0];

    this.selectedTaskDefinition = task;
  }
}
