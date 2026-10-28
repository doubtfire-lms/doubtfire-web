import {addDays, differenceInDays, differenceInWeeks, isAfter} from 'date-fns';
import {ChangeDetectionStrategy, Component, Inject, LOCALE_ID} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Task, TaskComment, TaskCommentService} from 'src/app/api/models/doubtfire-model';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from '../../services/alert.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class ReasonErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'extension-modal',
  templateUrl: './extension-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ExtensionModalComponent {
  protected reasonMinLength: number = 15;
  protected reasonMaxLength: number = 256;
  constructor(
    public dialogRef: MatDialogRef<ExtensionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {task: Task; afterApplication?: () => void},
    private alerts: AlertService,
  ) {}

  matcher = new ReasonErrorStateMatcher();
  currentLocale = AppInjector.get(LOCALE_ID);
  extensionData = new FormGroup({
    extensionReason: new FormControl('', [
      Validators.required,
      Validators.minLength(this.reasonMinLength),
      Validators.maxLength(this.reasonMaxLength),
    ]),
  });

  get extensionDuration(): number {
    // calculating the number of weeks between now and the requested date, rounding up
    const days = differenceInDays(this.extensionDate, this.data.task.localDueDate());
    let weeks = differenceInWeeks(this.extensionDate, this.data.task.localDueDate());
    if (days % 7 > 0 || weeks == 0) {
      // round week count up if there are less than a week left or requested range is not in weeks
      weeks++;
    }
    return weeks;
  }

  // minimum date is due date if before target date, current date if after target date
  minDate = new Date(
    addDays(
      isAfter(Date.now(), this.data.task.localDueDate())
        ? new Date()
        : this.data.task.localDueDate(),
      1,
    ),
  );
  maxDate = this.data.task.localDeadlineDate(); // deadline, hard deadline
  extensionDate = new Date(this.minDate);
  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.extensionDate = new Date(event.value);
  }

  private scrollCommentsDown(): void {
    setTimeout(() => {
      const objDiv = document.querySelector('div.comments-body');
      // let wrappedResult = angular.element(objDiv);
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 50);
  }

  submitApplication() {
    const tcs: TaskCommentService = AppInjector.get(TaskCommentService);
    tcs
      .requestExtension(
        this.extensionData.controls.extensionReason.value,
        this.extensionDuration,
        this.data.task,
      )
      .subscribe({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: ((tc: TaskComment) => {
          this.alerts.success('Extension requested.', 2000);
          this.scrollCommentsDown();
          if (typeof this.data.afterApplication === 'function') {
            this.data.afterApplication();
          }
        }).bind(this),

        error: ((response: never) => {
          this.alerts.error('Error requesting extension ' + response);
        }).bind(this),
      });
  }
}
