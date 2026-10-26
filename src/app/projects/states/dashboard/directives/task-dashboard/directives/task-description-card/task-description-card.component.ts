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

  public targetGradeDueDate(): Date {
    if (this.task) {
      return (
        this.taskDef?.gradeTargetDate(this.task.project.targetGrade) ?? this.taskDef?.localDueDate()
      );
    }

    return this.taskDef?.localDueDate();
  }

  public daysFromTargetDueDate(date: Date): number {
    const targetDate = this.targetGradeDueDate();
    if (!date || !targetDate) {
      return 0;
    }

    return Math.round(
      (this.calendarDayTimestamp(date) - this.calendarDayTimestamp(targetDate)) /
        (24 * 60 * 60 * 1000),
    );
  }

  public plannedSubmissionIsAfterFeedbackDeadline(): boolean {
    const plannedDate = this.dueDate();
    const feedbackDate = this.feedbackDate();
    if (!plannedDate || !feedbackDate) {
      return false;
    }

    return this.calendarDayTimestamp(plannedDate) > this.calendarDayTimestamp(feedbackDate);
  }

  private calendarDayTimestamp(date: Date): number {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
