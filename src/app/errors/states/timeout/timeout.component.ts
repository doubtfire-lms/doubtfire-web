import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from 'src/app/api/services/authentication.service';

@Component({
  selector: 'timeout',
  templateUrl: './timeout.component.html',
})
export class TimeoutComponent implements OnInit {
  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    setTimeout(() => this.authenticationService.signOut(false), 2000);
  }
}
