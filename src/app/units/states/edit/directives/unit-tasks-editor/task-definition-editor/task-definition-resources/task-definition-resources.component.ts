import { Component, Inject, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { TaskDefinition } from 'src/app/api/models/task-definition';
import { Unit } from 'src/app/api/models/unit';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader';

@Component({
  selector: 'f-task-definition-resources',
  templateUrl: 'task-definition-resources.component.html',
  styleUrls: ['task-definition-resources.component.scss'],
})
export class TaskDefinitionResourcesComponent {
  @Input() taskDefinition: TaskDefinition;

  constructor(private fileDownloaderService: FileDownloaderService, @Inject(alertService) private alertService: any) {}

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
      next: () => this.alertService.add('success', 'Deleted task sheet', 2000),
      error: (message) => this.alertService.add('danger', message, 6000),
    });
  }

  public removeTaskResources() {
    this.taskDefinition.deleteTaskResources().subscribe({
      next: () => this.alertService.add('success', 'Deleted task resources', 2000),
      error: (message) => this.alertService.add('danger', message, 6000),
    });
  }
}
