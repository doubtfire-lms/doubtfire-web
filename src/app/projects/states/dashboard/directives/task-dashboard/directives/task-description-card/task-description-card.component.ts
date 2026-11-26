import {formatDate} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
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
  private readonly markingDays = 7;

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
    @Inject(LOCALE_ID) private readonly locale: string,
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

  public dateRelativeToDueDate(date: Date): string {
    const days = this.daysFromTargetDueDate(date);
    if (days === 0) {
      return ' (its due date)';
    }

    const count = Math.abs(days);
    const direction = days < 0 ? 'before' : 'after';
    return `, ${count} day${count === 1 ? '' : 's'} ${direction} its due date`;
  }

  public todayRelativeToDueDate(): string {
    const days = this.daysFromTargetDueDate(new Date());
    if (days > 0) {
      return ` (${days} day${days === 1 ? '' : 's'} late)`;
    }
    if (days < 0) {
      const count = Math.abs(days);
      return ` (${count} day${count === 1 ? '' : 's'} before its due date)`;
    }
    return ' (its due date)';
  }

  public effectiveSubmissionDate(): Date {
    const plannedDate = this.dueDate();
    if (!plannedDate) {
      return undefined;
    }

    const today = new Date();
    return this.calendarDayTimestamp(today) > this.calendarDayTimestamp(plannedDate)
      ? today
      : plannedDate;
  }

  public plannedSubmissionDateHasPassed(): boolean {
    const plannedDate = this.dueDate();
    return (
      !!plannedDate &&
      this.calendarDayTimestamp(new Date()) > this.calendarDayTimestamp(plannedDate)
    );
  }

  public effectiveSubmissionIsAfterFeedbackDeadline(): boolean {
    const submissionDate = this.effectiveSubmissionDate();
    const feedbackDate = this.feedbackDate();
    if (!submissionDate || !feedbackDate) {
      return false;
    }

    return this.calendarDayTimestamp(submissionDate) > this.calendarDayTimestamp(feedbackDate);
  }

  public hasNotSubmitted(): boolean {
    return !this.task || !this.task.inSubmittedState();
  }

  public discussionTiming(): 'enough' | 'tight' | 'past' | null {
    if (!this.hasNotSubmitted()) {
      return null;
    }

    const submissionDate = this.effectiveSubmissionDate();
    const cutoff = this.discussionCutoffDate();
    if (!submissionDate || !cutoff) {
      return null;
    }

    const daysRemaining = this.daysUntilDiscussionCutoff();
    if (daysRemaining < 0) {
      return 'past';
    }

    return daysRemaining <= this.markingDays ? 'tight' : 'enough';
  }

  public daysUntilDiscussionCutoff(): number {
    const submissionDate = this.effectiveSubmissionDate();
    const cutoff = this.discussionCutoffDate();
    if (!submissionDate || !cutoff) {
      return 0;
    }

    return (
      (this.calendarDayTimestamp(cutoff) - this.calendarDayTimestamp(submissionDate)) /
      (24 * 60 * 60 * 1000)
    );
  }

  public discussionCutoffDate(): Date {
    const feedbackDate = this.feedbackDate();
    const lastTeachingDate = this.unit?.lastTeachingDate ?? this.taskDef?.unit?.lastTeachingDate;
    if (!feedbackDate) {
      return lastTeachingDate;
    }
    if (!lastTeachingDate) {
      return feedbackDate;
    }

    return this.calendarDayTimestamp(lastTeachingDate) < this.calendarDayTimestamp(feedbackDate)
      ? lastTeachingDate
      : feedbackDate;
  }

  public dateWithOrdinal(date: Date): string {
    if (!date) {
      return '';
    }

    const day = date.getDate();
    const suffix = day >= 11 && day <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][day % 10] ?? 'th');
    return `${formatDate(date, 'EEE d', this.locale)}${suffix} ${formatDate(date, 'MMM', this.locale)}`;
  }

  private calendarDayTimestamp(date: Date): number {
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
