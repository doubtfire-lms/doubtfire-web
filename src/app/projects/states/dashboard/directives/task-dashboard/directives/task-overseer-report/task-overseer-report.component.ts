import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatMenuTrigger} from '@angular/material/menu';
import {OverseerAssessment, UnitRole, UserService} from 'src/app/api/models/doubtfire-model';
import {Task} from 'src/app/api/models/task';
import {OverseerAssessmentService} from 'src/app/api/services/overseer-assessment.service';
import {OverseerStepResultService} from 'src/app/api/services/overseer-step-result.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskSubmissionService} from 'src/app/common/services/task-submission.service';
import {SubmissionFilesModalComponent} from './submission-files-modal/submission-files-modal.component';

@Component({
    selector: 'f-task-overseer-report',
    templateUrl: './task-overseer-report.component.html',
    styleUrl: './task-overseer-report.component.scss',
    standalone: false
})
export class TaskOverseerReportComponent implements OnInit {
  @Input() task: Task;
  @Input() loadOverseerAssessmentId?: number;
  public comparisonSourceAssessmentId: number | null = null;

  constructor(
    private alerts: AlertService,
    private submissions: TaskSubmissionService,
    private overseerAssessmentService: OverseerAssessmentService,
    private overseerStepResultsService: OverseerStepResultService,
    private dialog: MatDialog,
    private userService: UserService,
  ) {}

  public get currentUnitRole(): UnitRole | undefined {
    const currentUser = this.userService.currentUser;
    return this.task.unit.staff.find((ur) => ur.user.id === currentUser.id);
  }

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

  submissionOutput() {
    this.viewOutput = 'your_output';
  }

  expectedOutput() {
    this.viewOutput = 'expected_output';
  }

  public overseerAssessments: OverseerAssessment[] = [];

  public get comparisonSourceAssessment(): OverseerAssessment | null {
    if (!this.comparisonSourceAssessmentId) {
      return null;
    }
    return (
      this.overseerAssessments.find(
        (assessment) => assessment.id === this.comparisonSourceAssessmentId,
      ) ?? null
    );
  }

  ngOnInit(): void {
    this.loadAssessments();
  }

  loadAssessments(isRefresh: boolean = false) {
    if (isRefresh) {
      this.loadOverseerAssessmentId = null;
    }
    this.overseerAssessmentService.queryForTask(this.task).subscribe({
      next: (assessments) => {
        this.overseerAssessments = assessments;
        if (
          this.comparisonSourceAssessmentId &&
          !this.overseerAssessments.some(
            (assessment) => assessment.id === this.comparisonSourceAssessmentId,
          )
        ) {
          this.comparisonSourceAssessmentId = null;
        }
        for (const oa of this.overseerAssessments) {
          for (const result of oa.stepResultsCache.currentValues) {
            result.overseerStep = this.task.definition.overseerStepsCache.currentValues.find(
              (step) => step.id === result.overseerStepId,
            );
          }
        }
      },
      error: (error) => {
        this.alerts.error(`Failed to load overseer reports: ${error}`, 6000);
      },
    });
  }

  loadingAssessments = new Set<number>();

  onAssessmentOpen(overseerAssesment: OverseerAssessment) {
    if (this.loadOverseerAssessmentId === overseerAssesment.id) {
      setTimeout(() => {
        const el = document.getElementById(`oa-panel-${overseerAssesment.id}`);
        el?.scrollIntoView({behavior: 'smooth', block: 'start'});
      }, 250);
    }

    this.loadingAssessments.add(overseerAssesment.id);

    this.overseerStepResultsService.getOverseerStepResults(overseerAssesment).subscribe({
      next: () => {
        for (const oa of this.overseerAssessments) {
          for (const result of oa.stepResultsCache.currentValues) {
            result.overseerStep = this.task.definition.overseerStepsCache.currentValues.find(
              (step) => step.id === result.overseerStepId,
            );
          }
        }
        this.loadingAssessments.delete(overseerAssesment.id);
      },
      error: (error) => {
        console.error(error);
        this.loadingAssessments.delete(overseerAssesment.id);
      },
    });
  }

  viewSubmissionOptions(event: Event) {
    event.stopPropagation();
  }

  isComparisonSource(assessment: OverseerAssessment): boolean {
    return this.comparisonSourceAssessmentId === assessment.id;
  }

  hasComparisonSourceFor(assessment: OverseerAssessment): boolean {
    return (
      this.comparisonSourceAssessmentId !== null &&
      this.comparisonSourceAssessmentId !== assessment.id
    );
  }

  selectComparisonSource(
    assessment: OverseerAssessment,
    event?: Event,
    menuTrigger?: MatMenuTrigger,
  ) {
    event?.stopPropagation();
    this.comparisonSourceAssessmentId = assessment.id;
    menuTrigger?.closeMenu();
    this.alerts.message(`Selected submission ${assessment.timestampString} for comparison.`, 3500);
  }

  clearComparisonSource(event?: Event) {
    event?.stopPropagation();
    this.comparisonSourceAssessmentId = null;
  }

  compareWithSelected(assessment: OverseerAssessment, event?: Event) {
    event?.stopPropagation();
    const selected = this.comparisonSourceAssessment;
    if (!selected || selected.id === assessment.id) {
      return;
    }

    this.openSubmissionFilesDialog(assessment, selected);
  }

  viewSubmissionFiles(assessment: OverseerAssessment, event?: Event) {
    event?.stopPropagation();
    this.openSubmissionFilesDialog(assessment);
  }

  private openSubmissionFilesDialog(
    assessment: OverseerAssessment,
    comparedWith?: OverseerAssessment,
  ) {
    const assessmentIndex = this.overseerAssessments.findIndex((item) => item.id === assessment.id);
    const comparedWithIndex = comparedWith
      ? this.overseerAssessments.findIndex((item) => item.id === comparedWith.id)
      : -1;

    this.dialog.open(SubmissionFilesModalComponent, {
      data: {
        assessment,
        assessmentNumber:
          assessmentIndex >= 0 ? this.overseerAssessments.length - assessmentIndex : undefined,
        assessmentIsMostRecent: assessmentIndex === 0,
        comparedWith,
        comparedWithNumber:
          comparedWithIndex >= 0 ? this.overseerAssessments.length - comparedWithIndex : undefined,
        comparedWithIsMostRecent: comparedWithIndex === 0,
      },
      maxWidth: '95vw',
      width: '100%',
      height: '90vh',
      panelClass: 'submission-files-dialog',
    });
  }
}
