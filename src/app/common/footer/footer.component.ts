import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {Observable} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {TaskStatusEnum} from 'src/app/api/models/task-status';
import {UnitRole} from 'src/app/api/models/unit-role';
import {ProjectService} from 'src/app/api/services/project.service';
import {TaskService} from 'src/app/api/services/task.service';
import {UserService} from 'src/app/api/services/user.service';
import {SelectedTaskService} from 'src/app/projects/states/dashboard/selected-task.service';
import {FileDownloaderService} from '../file-downloader/file-downloader.service';
import {ConfirmationModalService} from '../modals/confirmation-modal/confirmation-modal.service';
import {DiscussedInClassReasonModalService} from '../modals/discussed-in-class-reason-modal/discussed-in-class-reason-modal.service';
import {TaskAssessmentModalService} from '../modals/task-assessment-modal/task-assessment-modal.service';
import {AlertService} from '../services/alert.service';

@Component({
  selector: 'f-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class FooterComponent implements OnInit {
  private readonly discussedInClassNotePrefix = `I'm manually marking this discussed in class because...`;

  constructor(
    public selectedTaskService: SelectedTaskService,
    public taskService: TaskService,
    private fileDownloader: FileDownloaderService,
    private taskAssessmentModal: TaskAssessmentModalService,
    private userService: UserService,
    private projectService: ProjectService,
    private confirmationModalService: ConfirmationModalService,
    private discussedInClassReasonModal: DiscussedInClassReasonModalService,
    private alertService: AlertService,
  ) {}

  @Input() viewType: 'inbox' | 'explorer' | 'moderation' | 'overflow';

  selectedTask$: Observable<Task>;
  selectedTask: Task;
  public showModerationStatusButtons = false;

  @ViewChild('similaritiesButton', {static: false, read: ElementRef})
  similaritiesButton: ElementRef;
  @ViewChild('warningText', {static: false, read: ElementRef}) warningText: ElementRef;
  public leftOffset: number;
  public topOffset: number;
  public warningTextLeftOffset: number;

  @HostListener('window:resize', ['$event'])
  onResize(_event) {
    // After window resizes, calc the location of the elements again
    this.findSimilaritiesButton();
  }

  findSimilaritiesButton() {
    if (!this.selectedTask?.similaritiesDetected) {
      return;
    }

    const w = this.similaritiesButton?.nativeElement.getBoundingClientRect().width;
    this.leftOffset = this.similaritiesButton?.nativeElement.offsetLeft + w / 2;
    this.topOffset = this.similaritiesButton?.nativeElement.offsetTop - 14;

    const totalPaddingOffset = 30;
    this.warningTextLeftOffset =
      this.leftOffset -
      (this.warningText?.nativeElement.getBoundingClientRect().width + totalPaddingOffset) / 2;
  }

  public get canAccessTutorNotes(): boolean {
    const tutor = this.selectedTask.tutor;
    if (!tutor) {
      return false;
    }

    if (!this.currentUnitRole) {
      return false;
    }

    // Ensure the unit is mapped correctly to access the mentor
    tutor.unit = this.selectedTask.unit;

    const canAccess =
      this.currentUnitRole.role === 'Convenor' ||
      this.currentUnitRole.role === 'Admin' ||
      (tutor.mentor && tutor.mentor.id === this.currentUnitRole.id);

    return canAccess;
  }

  public viewTutorNotes() {
    this.selectedTaskService.showTutorNotes();
  }

  ngOnInit(): void {
    // watch for changes to the selected task
    this.selectedTask$ = this.selectedTaskService.selectedTask$;

    this.selectedTask$.subscribe((task) => {
      this.selectedTask = task;

      // We need to timeout to give the DOM a chance to place the elements
      setTimeout(() => {
        this.findSimilaritiesButton();
      }, 10);
    });
  }

  downloadFiles() {
    this.fileDownloader.downloadFile(
      this.selectedTask.submittedFilesUrl(true),
      `${this.selectedTask.project.student.lastName}-${this.selectedTask.definition.name}.zip`,
    );
  }

  downloadSubmissionPdf() {
    this.fileDownloader.downloadFile(
      this.selectedTask.submissionUrl(true),
      `${this.selectedTask.project.student.lastName}-${this.selectedTask.definition.name}.pdf`,
    );
  }

  markTaskWorkingOnIt(task?: Task) {
    if (!task || !task.definition?.assessInPortfolioOnly) {
      return;
    }
    task.addComment(
      `**Automated Message:** Task "${task.definition.abbreviation} ${task.definition.name}" will be graded during portfolio assessment only. You can keep submitting it for feedback before the task deadline, but you must still submit it directly for portfolio assessment before the portfolio deadline.`,
    );
    setTimeout(() => {
      task.updateTaskStatus('working_on_it');
    }, 500);
  }

  viewTaskSheet() {
    this.selectedTaskService.showTaskSheet();
  }

  viewSubmission() {
    this.selectedTaskService.showSubmission();
  }

  viewSimilarity() {
    this.selectedTaskService.showSimilarity();
  }

  // viewOverseer() {
  //   this.taskAssessmentModal.show(this.selectedTask);
  // }

  viewOverseer() {
    this.selectedTaskService.showOverseerReports();
  }

  viewStaffNotes() {
    this.selectedTaskService.showStaffNotes();
  }

  viewDiscussionPrompts() {
    this.selectedTaskService.showDiscussionPrompts();
  }

  getJplagReport() {
    if (!this.selectedTask?.definition) {
      return;
    }
    this.fileDownloader.downloadFile(
      this.selectedTask.definition.getJplagReportUrl(),
      `${this.selectedTask.definition.abbreviation}-jplag-report`,
    );
  }

  public get currentUnitRole(): UnitRole | undefined {
    const currentUser = this.userService.currentUser;
    return this.selectedTask.unit.staff.find((ur) => ur.user.id === currentUser.id);
  }

  public get actionButtonEnabled(): boolean {
    if (!this.selectedTask) {
      return false;
    }

    if (this.selectedTask.loadingSubmissionDetails) {
      return false;
    }

    if (this.viewType === 'overflow' || this.selectedTask.claimedByUnitRoleId) {
      if (this.currentUnitRole.id !== this.selectedTask.claimedByUnitRoleId) {
        return false;
      }
    }

    return true;
  }

  public get completeButtonEnabled(): boolean {
    return this.actionButtonEnabled && !!this.selectedTask?.canMarkComplete;
  }

  public get discussActionStatus(): TaskStatusEnum {
    return this.selectedTask?.status === 'discuss' ? 'rediscuss' : 'discuss';
  }

  public get discussActionLabel(): string {
    return this.taskService.statusData(this.discussActionStatus).label;
  }

  public get discussActionIcon(): string {
    return this.taskService.statusData(this.discussActionStatus).materialIcon;
  }

  public get discussActionClass(): string {
    return this.taskService.statusData(this.discussActionStatus).class;
  }

  public get hideMainActionButtonsForModeration(): boolean {
    return this.viewType === 'moderation' && !this.showModerationStatusButtons;
  }

  public toggleModerationStatusButtons() {
    this.showModerationStatusButtons = !this.showModerationStatusButtons;
  }

  async markAsResubmit(task: Task) {
    if (!task?.definition || !task?.project) {
      return;
    }

    try {
      const hasReadyDependents = await task.hasReadyForFeedbackDependents();
      if (!hasReadyDependents) {
        task.updateTaskStatus('fix_and_resubmit');
        return;
      }

      this.confirmationModalService.show(
        'Move dependent tasks to Fix and Resubmit?',
        'This task is a prerequisite for one or more other tasks submitted by this student that are Ready for Feedback. Do you want to move those tasks to Fix and Resubmit as well?',
        () => {
          task.updateTaskStatus('fix_and_resubmit', false, true);
        },
        () => {
          task.updateTaskStatus('fix_and_resubmit');
        },
        'Yes, update dependent tasks',
        'No, just this task',
      );
    } catch (error) {
      this.alertService.error(`Failed to check dependent task statuses: ${error}`, 6000);
      task.updateTaskStatus('fix_and_resubmit');
    }
  }

  public markSelectedTaskAsDiscussed() {
    if (!this.selectedTask) {
      return;
    }

    if (!this.selectedTask.unit.enforceFeedbackBeforeDiscussedInClass) {
      this.selectedTask.markAsDiscussed();
      return;
    }

    this.discussedInClassReasonModal
      .show(
        'Mark Discussed in Class',
        `Add a tutor note explaining why ${this.selectedTask.definition.abbreviation} is being marked as discussed in class.`,
        this.discussedInClassNotePrefix,
      )
      .afterClosed()
      .subscribe((reason) => {
        if (!reason) {
          return;
        }

        this.selectedTask.markAsDiscussed(reason);
      });
  }
}
