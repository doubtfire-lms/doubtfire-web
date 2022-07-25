import { Component, OnInit } from '@angular/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-hero-sidebar',
  templateUrl: './hero-sidebar.component.html',
  styleUrls: ['./hero-sidebar.component.scss'],
})
export class HeroSidebarComponent implements OnInit {
  public externalName = this.constants.ExternalName;
  constructor(private constants: DoubtfireConstants) {}

  ngOnInit(): void {}
}
