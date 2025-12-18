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

  public viewOutput: 'your_output' | 'expected_output' | 'diff' | 'split_diff' = 'your_output';

  stdoutOptions = {
    theme: 'vs-dark',
    language: 'plaintext',
    renderMinimap: false,
    lineNumbers: false,

    minimap: {
      enabled: false,
    },
  };
  editorOptions = {
    theme: 'vs',
    language: 'text',
    renderMinimap: false,
    minimap: {
      enabled: false,
    },
    readOnly: true,
  };

  diffEditorOptions = {
    theme: 'vs',
    language: 'plaintext',
    renderMinimap: false,
    readOnly: true,
    domReadOnly: true,
    renderMarginRevertIcon: false,
    enableSplitViewResizing: false,
    useInlineViewWhenSpaceIsLimited: false,
    renderSideBySideInlineBreakpoint: 1000,
    renderSideBySide: true,
    compactMode: true,
    minimap: {
      enabled: false,
    },
    lineNumbers: 'off',
  };

  diff() {
    this.diffEditorOptions.renderSideBySide = false;
    this.diffEditorOptions.compactMode = true;
    this.diffEditorOptions = {...this.diffEditorOptions};
    this.viewOutput = 'diff';
  }

  splitDiff() {
    this.diffEditorOptions.renderSideBySide = true;
    this.diffEditorOptions.compactMode = false;
    this.diffEditorOptions = {...this.diffEditorOptions};
    setTimeout(() => {
      this.viewOutput = 'split_diff';
    }, 100);
  }

  yourOutput() {
    this.viewOutput = 'your_output';
  }

  expectedOutput() {
    this.viewOutput = 'expected_output';
  }

  public overseerAssessments: OverseerAssessment[] = [];

  ngOnInit(): void {
    console.log();

    this.overseerAssessmentService.queryForTask(this.task).subscribe({
      next: (assessments) => {
        this.overseerAssessments = assessments;
        for (const oa of this.overseerAssessments) {
          for (const result of oa.stepResultsCache.currentValues) {
            result.overseerStep = this.task.definition.overseerStepsCache.currentValues.find(
              (step) => step.id === result.overseerStepId,
            );
            console.log(result);
            console.log(this.task.definition.overseerStepsCache.currentValues);
          }
        }
        console.log(assessments);
      },
      error: (error) => {},
    });
  }
}
