import { Component, OnInit } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  constructor(private constants: DoubtfireConstants) {}
  ngOnInit(): void {}

  public externalName = this.constants.ExternalName;
}
