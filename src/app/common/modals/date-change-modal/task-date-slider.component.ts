import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Task} from 'src/app/api/models/doubtfire-model';
import {MappingFunctions} from 'src/app/api/services/mapping-fn';
import {AlertService} from '../../services/alert.service';
import {ConfirmationModalService} from '../confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'f-task-date-slider',
  styleUrl: './task-date-slider.component.scss',
  templateUrl: './task-date-slider.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDateSliderComponent implements OnChanges {
  @Input() task: Task;
  @Input() showTaskAbbr: boolean = false;

  /**
   * The value of the slider, representing the number of weeks
   */
  public value: number;

  private _originalDueDate: Date;
  private _originalExtension: number;

  /**
   * Switch between edit and view mode.
   */
  public editMode: boolean = false;

  public constructor(
    private alerts: AlertService,
    private confirmationModalService: ConfirmationModalService,
  ) {}

  public get max(): number {
    return this.task.unit.totalWeeks + Math.ceil(this.task.project.specConDays / 7);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.task && changes.task.currentValue) {
      if (this.editMode) {
        this.cancelEdit();
      }

      this.value = this.task.dueWeek;
      this._originalDueDate = this.task.dueDate;
      this._originalExtension = this.task.extensions;
    }
  }

  public cancelEdit(): void {
    this.editMode = false;
    // Reset the task to its original state
    this.task.dueDate = this._originalDueDate;
    this.task.extensions = this._originalExtension;
    this.value = this.task.dueWeek;
  }

  public updateExtension(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    this.task.dueWeek = value;
  }

  public editDueDate(): void {
    this.editMode = true;
  }

  public saveDueDate(): void {
    const save = () =>
      this.task.savePlannedDate().subscribe({
        next: () => {
          this.alerts.success('Plan updated successfully.');
          this.editMode = false;
          this.task.project.calcTopTasks();
        },
        error: (message) => {
          this.alerts.error(`Error updating due date: ${message}`, 6000);
          this.cancelEdit();
        },
      });

    if (this.afterDeadline()) {
      this.confirmationModalService.show(
        'Due date is after feedback deadline',
        'You won’t receive feedback for this task if you submit after the feedback cutoff. Do you want to continue?',
        save,
      );
    } else {
      save();
    }
  }

  public afterDeadline(): boolean {
    return this.task.localDueDate() > this.task.localDeadlineDate();
  }

  public closeToDeadline(): boolean {
    return MappingFunctions.addDays(this.task.localDueDate(), 7) > this.task.localDeadlineDate();
  }

  public canEdit(): boolean {
    return !this.task.isGroupTask() && this.task.unit.allowFlexibleDates;
  }
}
