import {ChangeDetectionStrategy, Component, Inject, LOCALE_ID} from '@angular/core';
import {FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
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
  selector: 'f-scorm-extension-modal',
  templateUrl: './scorm-extension-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ScormExtensionModalComponent {
  protected reasonMinLength: number = 15;
  protected reasonMaxLength: number = 256;
  constructor(
    public dialogRef: MatDialogRef<ScormExtensionModalComponent>,
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
      .requestScormExtension(this.extensionData.controls.extensionReason.value, this.data.task)
      .subscribe({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: ((tc: TaskComment) => {
          this.alerts.success('Extra attempt requested.', 2000);
          this.scrollCommentsDown();
          if (typeof this.data.afterApplication === 'function') {
            this.data.afterApplication();
          }
        }).bind(this),
        error: ((response: never) => {
          this.alerts.error('Error requesting extra attempt ' + response);
          console.log(response);
        }).bind(this),
      });
  }
}
