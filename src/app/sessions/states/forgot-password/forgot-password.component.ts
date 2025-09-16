import {Component} from '@angular/core';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  email: string = '';
  submitting = false;
  submitted = false;

  constructor(private auth: AuthenticationService, private alerts: AlertService) {}

  submit(): void {
    if (!this.email) return;
    this.submitting = true;
    this.auth.forgotPassword(this.email).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        this.alerts.success('If an account exists, a reset link was sent.', 6000);
      },
      error: () => {
        this.submitting = false;
        this.submitted = true;
        // same message to avoid enumeration
        this.alerts.success('If an account exists, a reset link was sent.', 6000);
      },
    });
  }
}



