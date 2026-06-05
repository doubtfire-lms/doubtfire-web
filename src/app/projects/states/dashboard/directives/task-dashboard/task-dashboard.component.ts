import {UnitRole} from 'src/app/api/models/doubtfire-model';
import {Task} from 'src/app/api/models/task';
import {TaskService} from 'src/app/api/services/task.service';
import {UserService} from 'src/app/api/services/user.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {TaskAssessmentModalService} from 'src/app/common/modals/task-assessment-modal/task-assessment-modal.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute} from '@angular/router';
import {SelectedTaskService} from '../../selected-task.service';
import {DashboardViews} from '../../selected-task.service';

@Component({
  selector: 'f-task-dashboard',
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss'],
  standalone: false,
})
export class TaskDashboardComponent implements OnInit, OnChanges {
  @Input() task: Task;
  @Input() pdfUrl: string;
  public DashboardViews = DashboardViews;

  public taskStatusData: any;
  public tutor = false;
  public urls: {
    taskSubmissionPdfAttachmentUrl: string;
    taskFilesUrl: string;
    taskSheetPdfUrl?: string;
    taskSubmissionPdfUrl?: string;
  };
  public overseerEnabledObs = this.doubtfire.IsOverseerEnabled;
  public currentView: DashboardViews;

  public currentIndex;

  onTabChange(event: MatTabChangeEvent) {
    switch (event.index) {
      case 0:
        this.setSelectedDashboardView(DashboardViews.details);
        break;
      case 1:
        this.setSelectedDashboardView(DashboardViews.task);
        break;
      case 2:
        this.setSelectedDashboardView(DashboardViews.submission);
        break;
      case 3:
        this.setSelectedDashboardView(DashboardViews.similarity);
        break;
      case 4:
        this.setSelectedDashboardView(DashboardViews.overseer);
        break;
      case 5:
        this.setSelectedDashboardView(DashboardViews.staff_notes);
        break;
      case 6:
        this.setSelectedDashboardView(DashboardViews.tutor_notes);
        break;
    }
  }

  constructor(
    private doubtfire: DoubtfireConstants,
    private taskService: TaskService,
    private taskAssessmentModal: TaskAssessmentModalService,
    private fileDownloader: FileDownloaderService,
    private route: ActivatedRoute,
    private userService: UserService,
    public selectedTaskService: SelectedTaskService,
  ) {}

  ngOnInit(): void {
    this.tutor = this.route.snapshot.queryParamMap.has('tutor');
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
    switch (view) {
      case DashboardViews.task:
        return 1;
      case DashboardViews.submission:
        return 2;
      case DashboardViews.similarity:
        return this.canAccessStaffViews ? 3 : 0;
      case DashboardViews.overseer:
        return this.canAccessStaffViews ? 4 : 0;
      case DashboardViews.staff_notes:
        return this.canAccessStaffViews ? 5 : 0;
      case DashboardViews.tutor_notes:
        return this.canAccessTutorNotes ? 6 : 0;
      default:
        return 0;
    }
  }

  private canAccessDashboardView(view: DashboardViews): boolean {
    switch (view) {
      case DashboardViews.similarity:
      case DashboardViews.overseer:
      case DashboardViews.staff_notes:
      case DashboardViews.discussion_prompts:
        return this.canAccessStaffViews;
      case DashboardViews.tutor_notes:
        return this.canAccessTutorNotes;
      default:
        return true;
    }
  }

  public get overseerEnabled() {
    return this.doubtfire.IsOverseerEnabled.value && this.task?.overseerEnabled;
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

  showSubmissionHistoryModal() {
    this.taskAssessmentModal.show(this.task);
  }

  downloadSubmission() {
    this.fileDownloader.downloadFile(this.urls.taskSubmissionPdfAttachmentUrl, 'submission.pdf');
  }

  downloadSubmittedFiles() {
    this.fileDownloader.downloadFile(this.urls.taskFilesUrl, 'submitted-files.zip');
  }
}
