import {Component, OnInit} from '@angular/core';
import {StateService} from '@uirouter/core';
import {AuthenticationService} from 'src/app/api/services/authentication.service';

@Component({
  selector: 'f-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  public loading: boolean = true;

  constructor(
    private authenticationService: AuthenticationService,
    private state: StateService,
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    this.authenticationService.afterAuthCall((result) => {
      if (!result) {
        return this.state.go('sign_in');
      }
      this.loading = false;
    });
  }
}
