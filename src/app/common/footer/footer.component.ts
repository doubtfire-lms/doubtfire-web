import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from 'src/app/api/models/task';
import { SelectedTaskService } from 'src/app/projects/states/dashboard/selected-task.service';

import { FileDownloaderService } from '../file-downloader/file-downloader.service';

@Component({
  selector: 'f-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(public selectedTaskService: SelectedTaskService, private fileDownloader: FileDownloaderService) {}

  selectedTask$: Observable<Task>;
  selectedTask: Task;

  @ViewChild('similaritiesButton', { static: false, read: ElementRef }) similaritiesButton: ElementRef;
  @ViewChild('warningText', { static: false, read: ElementRef }) warningText: ElementRef;
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
      this.leftOffset - (this.warningText?.nativeElement.getBoundingClientRect().width + totalPaddingOffset) / 2;
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
      `${this.selectedTask.project.student.lastName}-${this.selectedTask.definition.name}.zip`
    );
  }

  downloadSubmissionPdf() {
    this.fileDownloader.downloadFile(
      this.selectedTask.submissionUrl(true),
      `${this.selectedTask.project.student.lastName}-${this.selectedTask.definition.name}.pdf`
    );
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
}
