import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {Task} from 'src/app/api/models/doubtfire-model';
import {TaskAssessmentModalData} from './task-assessment-modal.service';

@Component({
  selector: 'task-assessment-modal',
  templateUrl: './task-assessment-modal.component.html',
  styleUrls: ['./task-assessment-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
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
