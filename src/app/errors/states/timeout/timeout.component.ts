import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {AuthenticationService} from '../../../api/services/authentication.service';

@Component({
  selector: 'f-timeout',
  templateUrl: 'timeout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon],
})
export class TimeoutComponent implements OnInit, OnDestroy {
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.timeoutHandle = setTimeout(() => {
      this.authenticationService.signOut(false);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }
}
