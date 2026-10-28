import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from 'src/app/api/services/authentication.service';

@Component({
  selector: 'f-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class EditProfileComponent implements OnInit {
  public loading: boolean = true;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    this.authenticationService.afterAuthCall((result) => {
      if (!result) {
        return this.router.navigateByUrl('/sign_in');
      }
      this.loading = false;
    });
  }
}
