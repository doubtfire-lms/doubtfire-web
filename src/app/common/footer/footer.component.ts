import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from 'src/app/api/models/task';
import { SelectedTaskService } from 'src/app/projects/states/dashboard/selected-task.service';

import { FileDownloaderService } from '../file-downloader/file-downloader';

@Component({
  selector: 'f-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(private selectedTaskService: SelectedTaskService, private fileDownloader: FileDownloaderService) {}

  selectedTask$: Observable<Task>;
  selectedTask: Task;

  ngOnInit(): void {
    // watch for changes to the selected task
    this.selectedTask$ = this.selectedTaskService.selectedTask$;

    this.selectedTask$.subscribe((task) => {
      this.selectedTask = task;
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
}
