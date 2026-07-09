import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute} from '@angular/router';
import {UnitRole} from 'src/app/api/models/doubtfire-model';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {UserService} from 'src/app/api/services/user.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {SelectedTaskService} from '../../selected-task.service';
import {DashboardViews} from '../../selected-task.service';

@Component({
  selector: 'f-task-dashboard',
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDashboardComponent implements OnInit, OnChanges {
  @Input() task: Task;
  @Input() pdfUrl: string;
  public DashboardViews = DashboardViews;

  public taskStatusData: {
    keys: TaskService['markedStatuses'];
    help: TaskService['helpDescriptions'];
    icons: TaskService['statusIcons'];
    labels: TaskService['statusLabels'];
    class: TaskService['statusClass'];
  };
  public tutor = false;
  public urls: {
    taskSubmissionPdfAttachmentUrl: string;
    taskFilesUrl: string;
    taskSheetPdfUrl?: string;
    taskSubmissionPdfUrl?: string;
  };
  public currentView: DashboardViews;
  public currentIndex = 0;

  private readonly tabViews: DashboardViews[] = [
    DashboardViews.details,
    DashboardViews.task,
    DashboardViews.submission,
    DashboardViews.submission_history,
    DashboardViews.similarity,
    DashboardViews.staff_notes,
    DashboardViews.tutor_notes,
  ];

  onTabChange(event: MatTabChangeEvent) {
    const view = this.tabViews[event.index];
    if (view !== undefined) {
      this.setSelectedDashboardView(view);
    }
  }

  constructor(
    private taskService: TaskService,
    private fileDownloader: FileDownloaderService,
    private route: ActivatedRoute,
    private userService: UserService,
    public selectedTaskService: SelectedTaskService,
  ) {}

  ngOnInit(): void {
    this.tutor = this.currentUnitRole !== undefined;
    this.setSelectedDashboardView(DashboardViews.details);
    this.selectedTaskService.currentView$.subscribe((view) => {
      this.currentView = this.canAccessDashboardView(view) ? view : DashboardViews.details;
      this.currentIndex = this.tabIndexForView(this.currentView);
    });

    this.taskStatusData = {
      keys: this.taskService.markedStatuses.slice().sort((a, b) => {
        return this.taskService.statusSeq.get(a) - this.taskService.statusSeq.get(b);
      }),
      help: this.taskService.helpDescriptions,
      icons: this.taskService.statusIcons,
      labels: this.taskService.statusLabels,
      class: this.taskService.statusClass,
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.task && changes.task.currentValue) {
      this.urls = {
        taskSheetPdfUrl: changes.task.currentValue.definition.getTaskPDFUrl(),
        taskSubmissionPdfUrl: changes.task.currentValue.submissionUrl(),
        taskSubmissionPdfAttachmentUrl: changes.task.currentValue.submissionUrl(true),
        taskFilesUrl: changes.task.currentValue.submittedFilesUrl(),
      };
      this.setSelectedDashboardView(DashboardViews.details);
    }
  }

  setSelectedDashboardView(view: DashboardViews): void {
    const nextView = this.canAccessDashboardView(view) ? view : DashboardViews.details;
    this.selectedTaskService.currentView$.next(nextView);
    this.currentView = nextView;
    this.currentIndex = this.tabIndexForView(nextView);
  }

  private tabIndexForView(view: DashboardViews): number {
    const index = this.tabViews.indexOf(view);
    return index >= 0 ? index : 0;
  }

  private canAccessDashboardView(view: DashboardViews): boolean {
    switch (view) {
      case DashboardViews.similarity:
      case DashboardViews.submission_history:
      case DashboardViews.staff_notes:
      case DashboardViews.discussion_prompts:
        return this.canAccessStaffViews;
      case DashboardViews.tutor_notes:
        return this.canAccessTutorNotes;
      default:
        return true;
    }
  }

  public get canAccessStaffViews(): boolean {
    return this.tutor || !!this.currentUnitRole;
  }

  public get currentUnitRole(): UnitRole | undefined {
    const currentUser = this.userService.currentUser;
    if (!currentUser) {
      return undefined;
    }

    return this.task?.unit?.staff?.find((ur) => ur.user?.id === currentUser.id);
  }

  public get canAccessTutorNotes(): boolean {
    const tutor = this.task?.tutor;
    if (!tutor) {
      return false;
    }

    if (!this.currentUnitRole) {
      return false;
    }

    tutor.unit = this.task.unit;

    return (
      this.currentUnitRole.role === 'Convenor' ||
      this.currentUnitRole.role === 'Admin' ||
      (tutor.mentor && tutor.mentor.id === this.currentUnitRole.id)
    );
  }

  downloadSubmission() {
    this.fileDownloader.downloadFile(this.urls.taskSubmissionPdfAttachmentUrl, 'submission.pdf');
  }

  downloadSubmittedFiles() {
    this.fileDownloader.downloadFile(this.urls.taskFilesUrl, 'submitted-files.zip');
  }
}
