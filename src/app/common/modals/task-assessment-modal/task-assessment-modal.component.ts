import {CdkScrollable} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {Subject} from 'rxjs';
import {Task} from 'src/app/api/models/doubtfire-model';
import {TaskOverseerReportComponent} from '../../../projects/states/dashboard/directives/task-dashboard/directives/task-overseer-report/task-overseer-report.component';
import {TaskAssessmentModalData} from './task-assessment-modal.service';

@Component({
  selector: 'task-assessment-modal',
  templateUrl: './task-assessment-modal.component.html',
  styleUrls: ['./task-assessment-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    TaskOverseerReportComponent,
    MatDialogActions,
    MatButton,
    MatIcon,
    MatDialogClose,
  ],
})
export class TaskAssessmentModalComponent implements OnInit {
  @Input() task: Task;
  @Input() overseerAssessmentId?: number;
  noDataFlag: boolean;
  refreshTrigger: Subject<boolean> = new Subject();

  constructor(
    public dialogRef: MatDialogRef<TaskAssessmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskAssessmentModalData,
  ) {}

  ngOnInit() {
    this.task = this.data.task;
    this.overseerAssessmentId = this.data.overseerAssessmentId;
  }

  setNoDataFlag($event) {
    this.noDataFlag = $event;
  }

  resfreshChildComponent() {
    this.refreshTrigger.next(true);
  }
}
