import {Component, Input, OnInit} from '@angular/core';
import {OverseerAssessment} from 'src/app/api/models/doubtfire-model';
import {Task} from 'src/app/api/models/task';
import {OverseerAssessmentService} from 'src/app/api/services/overseer-assessment.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskSubmissionService} from 'src/app/common/services/task-submission.service';

@Component({
  selector: 'f-task-overseer-report',
  templateUrl: './task-overseer-report.component.html',
  styleUrl: './task-overseer-report.component.scss',
})
export class TaskOverseerReportComponent implements OnInit {
  @Input() task: Task;

  constructor(
    private alerts: AlertService,
    private submissions: TaskSubmissionService,
    private overseerAssessmentService: OverseerAssessmentService,
  ) {}

  editorOptions = {
    theme: 'vs',
    language: 'text',
    renderMinimap: false,
    readOnly: true,
    renderSideBySide: false,
    minimap: {
      enabled: false,
    },
  };

  public overseerAssessments: OverseerAssessment[] = [];

  ngOnInit(): void {
    console.log();

    this.overseerAssessmentService.queryForTask(this.task).subscribe({
      next: (assessments) => {
        this.overseerAssessments = assessments;
        console.log(assessments);
      },
      error: (error) => {},
    });
  }
}
