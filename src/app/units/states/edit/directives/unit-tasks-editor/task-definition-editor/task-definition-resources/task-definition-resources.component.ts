import {Component, Inject, Input} from '@angular/core';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-task-definition-resources',
  templateUrl: 'task-definition-resources.component.html',
  styleUrls: ['task-definition-resources.component.scss'],
})
export class TaskDefinitionResourcesComponent {
  @Input() taskDefinition: TaskDefinition;

  constructor(
    private fileDownloaderService: FileDownloaderService,
    private alerts: AlertService,
    private taskDefinitionService: TaskDefinitionService,
  ) {}

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  public downloadTaskSheet() {
    this.fileDownloaderService.downloadFile(
      this.taskDefinition.getTaskPDFUrl(),
      this.taskDefinition.name + '.pdf',
    );
  }

  public downloadTaskResources() {
    this.fileDownloaderService.downloadFile(
      this.taskDefinition.getTaskResourcesUrl(true),
      this.taskDefinition.name + '.zip',
    );
  }

  public removeTaskSheet() {
    this.taskDefinition.deleteTaskSheet().subscribe({
      next: () => this.alerts.success('Deleted task sheet', 2000),
      error: (message) => this.alerts.error(message, 6000),
    });
  }

  public removeTaskResources() {
    this.taskDefinition.deleteTaskResources().subscribe({
      next: () => this.alerts.success('Deleted task resources', 2000),
      error: (message) => this.alerts.error(message, 6000),
    });
  }

  public uploadTaskSheet(files: FileList) {
    const validFiles = Array.from(files as ArrayLike<File>).filter(
      (f) => f.type === 'application/pdf',
    );
    if (validFiles.length > 0) {
      const file = validFiles[0];
      this.taskDefinitionService.uploadTaskSheet(this.taskDefinition, file).subscribe({
        next: () => {
          this.alerts.success('Uploaded task sheet', 2000);
          this.taskDefinition.hasTaskSheet = true;
        },
        error: (message) => this.alerts.error(message, 6000),
      });
    } else {
      this.alerts.error('Please drop a PDF to upload for this task', 6000);
    }
  }

  public uploadTaskResources(files: FileList) {
    const validFiles = Array.from(files as ArrayLike<File>).filter(
      (f) => f.type === 'application/zip' || f.type === 'application/x-zip-compressed',
    );
    if (validFiles.length > 0) {
      const file = validFiles[0];
      this.taskDefinitionService.uploadTaskResources(this.taskDefinition, file).subscribe({
        next: () => {
          this.alerts.success('Uploaded task resources', 2000);
          this.taskDefinition.hasTaskResources = true;
        },
        error: (message) => this.alerts.error(message, 6000),
      });
    } else {
      this.alerts.error('Please drop a Zip to upload for this task', 6000);
    }
  }
}
