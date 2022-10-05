import { Component, Input, Inject } from '@angular/core';
import { gradeService } from 'src/app/ajs-upgraded-providers';
import { Task, TaskDefinition, Unit } from 'src/app/api/models/doubtfire-model';
import { FileDownloaderService } from 'src/app/common/file-downloader/file-downloader';

@Component({
  selector: 'f-task-description-card',
  templateUrl: 'task-description-card.component.html',
  styleUrls: ['task-description-card.component.scss'],
})
export class TaskDescriptionCardComponent {
  @Input() task: Task;
  @Input() taskDef: TaskDefinition;
  @Input() unit: Unit;

  public grades: { names: any; acronyms: any };

  constructor(
    @Inject(gradeService) private GradeService: any,
    @Inject(FileDownloaderService) private fileDownloader: FileDownloaderService
  ) {
    this.grades = {
      names: GradeService.grades,
      acronyms: GradeService.gradeAcronyms,
    };
  }

  public downloadTaskSheet() {
    this.fileDownloader.downloadFile(
      this.taskDef.getTaskPDFUrl(true),
      `${this.unit.code}-${this.taskDef.abbreviation}-TaskSheet.pdf`
    );
  }

  public downloadResources() {
    this.fileDownloader.downloadFile(
      this.taskDef.getTaskResourcesUrl(true),
      `${this.unit.code}-${this.taskDef.abbreviation}-TaskResources.zip`
    );
  }

  public dueDate(): Date {
    if (this.task) return this.task.localDueDate();
    else if (this.taskDef) return this.taskDef.targetDate;
    else return undefined;
  }

  public startDate(): Date {
    return this.taskDef?.startDate;
  }

  public shouldShowDeadline(): boolean {
    return this.task && this.task.daysUntilDeadlineDate() <= 14;
  }
}
