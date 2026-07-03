import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTab, MatTabChangeEvent, MatTabGroup, MatTabLabel} from '@angular/material/tabs';
import {UnitRole} from 'src/app/api/models/doubtfire-model';
import {Task} from 'src/app/api/models/task';
import {UserService} from 'src/app/api/services/user.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {fPdfViewerComponent} from '../../../../../../common/pdf-viewer/pdf-viewer.component';
import {StaffNotesViewComponent} from '../../../../../../projects/states/dashboard/directives/task-dashboard/directives/staff-notes-view/staff-notes-view.component';
import {TaskOverseerReportComponent} from '../../../../../../projects/states/dashboard/directives/task-dashboard/directives/task-overseer-report/task-overseer-report.component';
import {TaskSimilarityViewComponent} from '../../../../../../projects/states/dashboard/directives/task-dashboard/directives/task-similarity-view/task-similarity-view.component';
import {TutorNotesViewComponent} from '../../../../../../projects/states/dashboard/directives/task-dashboard/directives/tutor-notes-view/tutor-notes-view.component';

enum InboxDashboardTab {
  submission = 0,
  taskSheet = 1,
  similarities = 2,
  overseer = 3,
  staffNotes = 4,
  tutorNotes = 5,
}

@Component({
  selector: 'f-inbox-dashboard',
  templateUrl: './inbox-dashboard.component.html',
  host: {'class': 'block h-full'},
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatTabGroup,
    MatTab,
    MatTabLabel,
    MatIcon,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    fPdfViewerComponent,
    StaffNotesViewComponent,
    TutorNotesViewComponent,
    TaskSimilarityViewComponent,
    TaskOverseerReportComponent,
  ],
})
export class InboxDashboardComponent implements OnChanges {
  @Input() task: Task;
  @Output() visiblePdfUrlChange: EventEmitter<string> = new EventEmitter();

  public readonly InboxDashboardTab = InboxDashboardTab;
  public currentTab: InboxDashboardTab = InboxDashboardTab.submission;
  public currentIndex = InboxDashboardTab.submission;

  constructor(
    private fileDownloader: FileDownloaderService,
    private userService: UserService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.task) {
      this.selectDefaultTab();
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.setSelectedTab(event.index as InboxDashboardTab);
  }

  downloadSubmission(): void {
    if (!this.task?.hasPdf) {
      return;
    }

    this.fileDownloader.downloadFile(this.task.submissionUrl(true), 'submission.pdf');
  }

  downloadSubmittedFiles(): void {
    if (!this.task) {
      return;
    }

    this.fileDownloader.downloadFile(this.task.submittedFilesUrl(), 'submitted-files.zip');
  }

  public get overseerEnabled(): boolean {
    return this.task?.overseerEnabled ?? false;
  }

  private selectDefaultTab(): void {
    if (this.task) {
      this.setSelectedTab(InboxDashboardTab.submission);
    } else {
      this.currentTab = InboxDashboardTab.submission;
      this.currentIndex = InboxDashboardTab.submission;
      this.visiblePdfUrlChange.emit(null);
    }
  }

  private setSelectedTab(tab: InboxDashboardTab): void {
    this.currentTab = tab;
    this.currentIndex = tab;
    this.visiblePdfUrlChange.emit(this.pdfUrlForTab(tab));
  }

  private pdfUrlForTab(tab: InboxDashboardTab): string {
    if (!this.task) {
      return null;
    }

    switch (tab) {
      case InboxDashboardTab.submission:
        return this.task.hasPdf ? this.task.submissionUrl() : null;
      case InboxDashboardTab.taskSheet:
        return this.task.definition?.hasTaskSheet ? this.task.definition.getTaskPDFUrl() : null;
      default:
        return null;
    }
  }

  public get currentUnitRole(): UnitRole | undefined {
    const currentUser = this.userService.currentUser;
    return this.task.unit.staff.find((ur) => ur.user.id === currentUser.id);
  }

  public get canAccessTutorNotes(): boolean {
    const tutor = this.task.tutor;
    if (!tutor) {
      return false;
    }

    if (!this.currentUnitRole) {
      return false;
    }

    // Ensure the unit is mapped correctly to access the mentor
    tutor.unit = this.task.unit;

    const canAccess =
      this.currentUnitRole.role === 'Convenor' ||
      this.currentUnitRole.role === 'Admin' ||
      (tutor.mentor && tutor.mentor.id === this.currentUnitRole.id);

    return canAccess;
  }
}
