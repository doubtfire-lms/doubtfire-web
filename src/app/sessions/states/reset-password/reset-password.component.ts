import {Component} from '@angular/core';
import {AuthenticationService} from 'src/app/api/services/authentication.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {StateService, UIRouterGlobals} from '@uirouter/angular';

@Component({
  selector: 'f-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  token: string = '';
  password: string = '';
  submitting = false;
  done = false;

  constructor(
    private auth: AuthenticationService,
    private alerts: AlertService,
    private state: StateService,
    private globals: UIRouterGlobals,
  ) {
    const t = this.globals.params['token'];
    this.token = typeof t === 'string' ? t : '';
  }

  submit(): void {
    if (!this.password || !this.token) return;
    this.submitting = true;
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.submitting = false;
        this.done = true;
        this.alerts.success('Password updated. Please sign in.', 6000);
        this.state.go('sign_in');
      },
      error: (err) => {
        this.submitting = false;
        this.alerts.error(err, 6000);
      },
    });
  }
}



