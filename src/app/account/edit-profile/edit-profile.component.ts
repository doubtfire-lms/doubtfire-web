import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/api/services/authentication.service';
import { AlertService } from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent {
  current_password: string = '';
  new_password: string = '';
  changing = false;

  constructor(private auth: AuthenticationService, private alerts: AlertService) {}

  changePassword(): void {
    if (!this.current_password || !this.new_password) return;
    this.changing = true;
    this.auth.changePassword(this.current_password, this.new_password).subscribe({
      next: () => {
        this.changing = false;
        this.current_password = '';
        this.new_password = '';
        this.alerts.success('Password updated.', 6000);
      },
      error: (err) => {
        this.changing = false;
        this.alerts.error(err, 6000);
      },
    });
  }
}
