import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
} from '@angular/core';
import {Task, TaskDefinition, Unit} from 'src/app/api/models/doubtfire-model';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {GradeService} from 'src/app/common/services/grade.service';

@Component({
  selector: 'f-task-description-card',
  templateUrl: 'task-description-card.component.html',
  styleUrls: ['task-description-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDescriptionCardComponent {
  @Output() switchView$: EventEmitter<string> = new EventEmitter();

  @Input() task: Task;
  @Input() taskDef: TaskDefinition;
  @Input() unit: Unit;

  public grades: {
    names: GradeService['grades'];
    acronyms: GradeService['gradeAcronyms'];
  };

  constructor(
    private GradeService: GradeService,
    @Inject(FileDownloaderService) private fileDownloader: FileDownloaderService,
  ) {
    this.grades = {
      names: GradeService.grades,
      acronyms: GradeService.gradeAcronyms,
    };
  }

  public downloadTaskSheet() {
    this.fileDownloader.downloadFile(
      this.taskDef.getTaskPDFUrl(true),
      `${this.unit.code}-${this.taskDef.abbreviation}-TaskSheet.pdf`,
    );
  }

  public viewTaskSheet() {
    this.switchView$.emit('task');
  }

  public downloadResources() {
    this.fileDownloader.downloadFile(
      this.taskDef.getTaskResourcesUrl(true),
      `${this.unit.code}-${this.taskDef.abbreviation}-TaskResources.zip`,
    );
  }

  public dueDate(): Date {
    if (this.task) {
      return this.task.localDueDate();
    } else if (this.taskDef) {
      return this.taskDef.targetDate;
    } else {
      return undefined;
    }
  }

  public startDate(): Date {
    return this.task?.startDate ?? this.taskDef?.startDate;
  }

  public feedbackDate(): Date {
    if (this.task) {
      return this.task.localDeadlineDate();
    }
    return this.taskDef?.localDeadlineDate();
  }

  public shouldShowDeadline(): boolean {
    return this.task && this.task.daysUntilDeadlineDate() <= 14;
  }
}
