import Convert from 'ansi-to-html';
import DOMPurify from 'dompurify';
import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatMenuTrigger} from '@angular/material/menu';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {forkJoin} from 'rxjs';
import {OverseerAssessment, UnitRole, UserService} from 'src/app/api/models/doubtfire-model';
import {SubmissionHistory} from 'src/app/api/models/submission-history';
import {Task} from 'src/app/api/models/task';
import {OverseerAssessmentService} from 'src/app/api/services/overseer-assessment.service';
import {OverseerStepResultService} from 'src/app/api/services/overseer-step-result.service';
import {SubmissionHistoryService} from 'src/app/api/services/submission-history.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {SubmissionFilesModalComponent} from './submission-files-modal/submission-files-modal.component';

@Component({
  selector: 'f-task-overseer-report',
  templateUrl: './task-overseer-report.component.html',
  styleUrl: './task-overseer-report.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskOverseerReportComponent implements OnInit {
  @Input() task: Task;
  @Input() loadOverseerAssessmentId?: number;
  public histories: SubmissionHistory[] = [];
  public overseerAssessments: OverseerAssessment[] = [];
  public comparisonSourceHistoryId: number | null = null;
  public loading = false;

  constructor(
    private alerts: AlertService,
    private submissionHistoryService: SubmissionHistoryService,
    private overseerAssessmentService: OverseerAssessmentService,
    private overseerStepResultsService: OverseerStepResultService,
    private dialog: MatDialog,
    private readonly sanitizer: DomSanitizer,
    private userService: UserService,
  ) {
    DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
      if (data.attrName !== 'style') {
        return;
      }
      data.attrValue = data.attrValue
        .split(';')
        .map((rule) => rule.trim())
        .filter((rule) =>
          /^(color|background-color|font-weight|font-style)\s*:\s*(#[0-9a-f]{3,8}|[a-z]+|\d+)\b/i.test(
            rule,
          ),
        )
        .join('; ');
    });
  }

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

  private ansi = new Convert({
    newline: false,
    escapeXML: true,
    fg: '#1f2937',
    bg: '#f9fafb',
  });

  protected renderOutput(output?: string | null): SafeHtml {
    const html = this.ansi.toHtml(output ?? '');

    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['span', 'br', 'i', 'b', 'strong', 'em', 'code'],
      ALLOWED_ATTR: ['style'],
    });

    return this.sanitizer.bypassSecurityTrustHtml(clean);
  }

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

  public get comparisonSourceHistory(): SubmissionHistory | null {
    if (!this.comparisonSourceHistoryId) {
      return null;
    }
    return this.histories.find((history) => history.id === this.comparisonSourceHistoryId) ?? null;
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(isRefresh: boolean = false) {
    if (isRefresh) {
      this.loadOverseerAssessmentId = null;
    }
    this.loading = true;

    forkJoin({
      histories: this.submissionHistoryService.queryForTask(this.task),
      assessments: this.overseerAssessmentService.queryForTask(this.task),
    }).subscribe({
      next: ({histories, assessments}) => {
        this.histories = histories;
        this.overseerAssessments = assessments;

        if (
          this.comparisonSourceHistoryId &&
          !this.histories.some((history) => history.id === this.comparisonSourceHistoryId)
        ) {
          this.comparisonSourceHistoryId = null;
        }

        for (const oa of this.overseerAssessments) {
          for (const result of oa.stepResultsCache.currentValues) {
            result.overseerStep = this.task.definition.overseerStepsCache.currentValues.find(
              (step) => step.id === result.overseerStepId,
            );
          }
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.alerts.error(`Failed to load submission history: ${error}`, 6000);
      },
    });
  }

  loadingAssessments: Set<number> = new Set();

  assessmentFor(history: SubmissionHistory): OverseerAssessment | undefined {
    return this.overseerAssessments.find(
      (assessment) => assessment.submissionHistoryId === history.id,
    );
  }

  onHistoryOpen(history: SubmissionHistory) {
    const overseerAssessment = this.assessmentFor(history);
    if (!overseerAssessment) {
      return;
    }

    if (this.loadOverseerAssessmentId === overseerAssessment.id) {
      setTimeout(() => {
        const el = document.getElementById(`history-panel-${history.id}`);
        el?.scrollIntoView({behavior: 'smooth', block: 'start'});
      }, 250);
    }

    this.loadingAssessments.add(overseerAssessment.id);

    this.overseerStepResultsService.getOverseerStepResults(overseerAssessment).subscribe({
      next: () => {
        for (const oa of this.overseerAssessments) {
          for (const result of oa.stepResultsCache.currentValues) {
            result.overseerStep = this.task.definition.overseerStepsCache.currentValues.find(
              (step) => step.id === result.overseerStepId,
            );
          }
        }
        this.loadingAssessments.delete(overseerAssessment.id);
      },
      error: (error) => {
        console.error(error);
        this.loadingAssessments.delete(overseerAssessment.id);
      },
    });
  }

  viewSubmissionOptions(event: Event) {
    event.stopPropagation();
  }

  isComparisonSource(history: SubmissionHistory): boolean {
    return this.comparisonSourceHistoryId === history.id;
  }

  hasComparisonSourceFor(history: SubmissionHistory): boolean {
    return this.comparisonSourceHistoryId !== null && this.comparisonSourceHistoryId !== history.id;
  }

  selectComparisonSource(history: SubmissionHistory, event?: Event, menuTrigger?: MatMenuTrigger) {
    event?.stopPropagation();
    this.comparisonSourceHistoryId = history.id;
    menuTrigger?.closeMenu();
    this.alerts.message(`Selected submission ${history.timestampString} for comparison.`, 3500);
  }

  clearComparisonSource(event?: Event) {
    event?.stopPropagation();
    this.comparisonSourceHistoryId = null;
  }

  compareWithSelected(history: SubmissionHistory, event?: Event) {
    event?.stopPropagation();
    const selected = this.comparisonSourceHistory;
    if (!selected || selected.id === history.id) {
      return;
    }

    this.openSubmissionFilesDialog(history, selected);
  }

  viewSubmissionFiles(history: SubmissionHistory, event?: Event) {
    event?.stopPropagation();
    this.openSubmissionFilesDialog(history);
  }

  private openSubmissionFilesDialog(history: SubmissionHistory, comparedWith?: SubmissionHistory) {
    const historyIndex = this.histories.findIndex((item) => item.id === history.id);
    const comparedWithIndex = comparedWith
      ? this.histories.findIndex((item) => item.id === comparedWith.id)
      : -1;

    this.dialog.open(SubmissionFilesModalComponent, {
      data: {
        assessment: history,
        assessmentNumber: historyIndex >= 0 ? this.histories.length - historyIndex : undefined,
        assessmentIsMostRecent: historyIndex === 0,
        comparedWith,
        comparedWithNumber:
          comparedWithIndex >= 0 ? this.histories.length - comparedWithIndex : undefined,
        comparedWithIsMostRecent: comparedWithIndex === 0,
      },
      maxWidth: '95vw',
      width: '100%',
      height: '90vh',
      panelClass: 'submission-files-dialog',
    });
  }
}
