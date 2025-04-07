import {Component, Input} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';

@Component({
  selector: 'f-task-definition-scorm',
  templateUrl: 'task-definition-scorm.component.html',
  styleUrls: ['task-definition-scorm.component.scss'],
})
export class TaskDefinitionScormComponent {
  @Input() taskDefinition: TaskDefinition;

  constructor(
    private fileDownloaderService: FileDownloaderService,
    private alerts: AlertService,
    private taskDefinitionService: TaskDefinitionService,
  ) {}

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  /**
   * Open the SCORM test in a new tab - using preview mode.
   */
  public previewScormTest() {
    this.taskDefinition.previewScormTest();
  }

  public downloadScormData() {
    this.fileDownloaderService.downloadFile(
      this.taskDefinition.getScormDataUrl(true),
      this.taskDefinition.name + '-SCORM.zip',
    );
  }

  public removeScormData() {
    this.taskDefinition.deleteScormData().subscribe({
      next: () => this.alerts.success('Deleted SCORM test data', 2000),
      error: (message) => this.alerts.error(message, 6000),
    });
  }

  public uploadScormData(files: FileList) {
    // console.log(Array.from(files).map((f) => f.type));
    const validMimeTypes = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];
    const validFiles = Array.from(files as ArrayLike<File>).filter((f) =>
      validMimeTypes.includes(f.type),
    );
    if (validFiles.length > 0) {
      const file = validFiles[0];
      this.taskDefinitionService.uploadScormData(this.taskDefinition, file).subscribe({
        next: () => {
          this.alerts.success('Uploaded SCORM test data', 2000);
          this.taskDefinition.hasScormData = true;
        },
        error: (message) => this.alerts.error(message, 6000),
      });
    } else {
      this.alerts.error('Please drop a zip file to upload SCORM test data for this task', 6000);
    }
  }
}
