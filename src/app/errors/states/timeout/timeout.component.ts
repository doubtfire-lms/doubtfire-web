import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from 'src/app/api/services/authentication.service';

@Component({
  selector: 'f-timeout',
  templateUrl: './timeout.component.html',
  styleUrls: ['./timeout.component.scss'],
})
export class TimeoutComponent implements OnInit {
  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    setTimeout(() => this.authenticationService.signOut(false), 2000);
  }
}
