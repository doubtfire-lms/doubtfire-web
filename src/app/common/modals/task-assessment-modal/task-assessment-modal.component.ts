import { Component, OnInit, Inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { TaskAssessmentResult } from '../../services/task-submission.service';

@Component({
  selector: 'app-task-assessment-modal',
  templateUrl: './task-assessment-modal.component.html',
  styleUrls: ['./task-assessment-modal.component.scss'],
})
export class TaskAssessmentModalComponent implements OnInit {
  @Input('assessment_result') assessmentResult: string;

  constructor(public dialogRef: MatDialogRef<TaskAssessmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskAssessmentResult,
    @Inject(alertService) private alerts: any, ) { }

  ngOnInit() {
  }

}
