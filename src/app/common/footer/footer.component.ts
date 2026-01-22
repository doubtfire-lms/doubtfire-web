import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {SelectedTaskService} from 'src/app/projects/states/dashboard/selected-task.service';
import {TaskService} from 'src/app/api/services/task.service';
import {FileDownloaderService} from '../file-downloader/file-downloader.service';
import {TaskAssessmentModalService} from '../modals/task-assessment-modal/task-assessment-modal.service';

@Component({
  selector: 'f-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(
    public selectedTaskService: SelectedTaskService,
    public taskService: TaskService,
    private fileDownloader: FileDownloaderService,
    private taskAssessmentModal: TaskAssessmentModalService,
  ) {}

  selectedTask$: Observable<Task>;
  selectedTask: Task;

  @ViewChild('similaritiesButton', {static: false, read: ElementRef})
  similaritiesButton: ElementRef;
  @ViewChild('warningText', {static: false, read: ElementRef}) warningText: ElementRef;
  public leftOffset: number;
  public topOffset: number;
  public warningTextLeftOffset: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // After window resizes, calc the location of the elements again
    this.findSimilaritiesButton();
  }

  findSimilaritiesButton() {
    if (!this.selectedTask?.similaritiesDetected) return;

    const w = this.similaritiesButton?.nativeElement.getBoundingClientRect().width;
    this.leftOffset = this.similaritiesButton?.nativeElement.offsetLeft + w / 2;
    this.topOffset = this.similaritiesButton?.nativeElement.offsetTop - 14;

    const totalPaddingOffset = 30;
    this.warningTextLeftOffset =
      this.leftOffset -
      (this.warningText?.nativeElement.getBoundingClientRect().width + totalPaddingOffset) / 2;
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
}
