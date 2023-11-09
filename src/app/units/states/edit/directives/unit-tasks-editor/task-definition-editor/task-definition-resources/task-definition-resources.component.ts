import { Component, Inject, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { TaskDefinitionService } from 'src/app/api/services/task-definition.service';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader.service';

@Component({
  selector: 'f-task-definition-resources',
  templateUrl: 'task-definition-resources.component.html',
  styleUrls: ['task-definition-resources.component.scss'],
})
export class TaskDefinitionResourcesComponent {
  @Input() taskDefinition: TaskDefinition;

  constructor(
    private fileDownloaderService: FileDownloaderService,
    @Inject(alertService) private alerts: any,
    private taskDefinitionService: TaskDefinitionService
  ) {}

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  public downloadTaskSheet() {
    this.fileDownloaderService.downloadFile(this.taskDefinition.getTaskPDFUrl(), this.taskDefinition.name + '.pdf');
  }

  public downloadTaskResources() {
    this.fileDownloaderService.downloadFile(
      this.taskDefinition.getTaskResourcesUrl(true),
      this.taskDefinition.name + '.zip'
    );
  }

  public removeTaskSheet() {
    this.taskDefinition.deleteTaskSheet().subscribe({
      next: () => this.alerts.add('success', 'Deleted task sheet', 2000),
      error: (message) => this.alerts.add('danger', message, 6000),
    });
  }

  public removeTaskResources() {
    this.taskDefinition.deleteTaskResources().subscribe({
      next: () => this.alerts.add('success', 'Deleted task resources', 2000),
      error: (message) => this.alerts.add('danger', message, 6000),
    });
  }

  public uploadTaskSheet(files: FileList) {
    const validFiles = Array.from(files as ArrayLike<File>).filter((f) => f.type === 'application/pdf');
    if (validFiles.length > 0) {
      const file = validFiles[0];
      this.taskDefinitionService.uploadTaskSheet(this.taskDefinition, file).subscribe({
        next: () => this.alerts.add('success', 'Uploaded task sheet', 2000),
        error: (message) => this.alerts.add('danger', message, 6000),
      });
    } else {
      this.alerts.add('danger', 'Please drop a PDF to upload for this task', 6000);
    }
  }

  public uploadTaskResources(files: FileList) {
    const validFiles = Array.from(files as ArrayLike<File>).filter((f) => f.type === 'application/zip');
    if (validFiles.length > 0) {
      const file = validFiles[0];
      this.taskDefinitionService.uploadTaskResources(this.taskDefinition, file).subscribe({
        next: () => this.alerts.add('success', 'Uploaded task sheet', 2000),
        error: (message) => this.alerts.add('danger', message, 6000),
      });
    } else {
      this.alerts.add('danger', 'Please drop a PDF to upload for this task', 6000);
    }
  }

}
