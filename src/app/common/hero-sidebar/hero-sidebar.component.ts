import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'f-hero-sidebar',
  templateUrl: './hero-sidebar.component.html',
  styleUrls: ['./hero-sidebar.component.scss'],
  standalone: false,
})
export class HeroSidebarComponent implements OnInit {
  public externalName = this.constants.ExternalName;
  constructor(private constants: DoubtfireConstants) {}

  ngOnInit(): void {}
}
