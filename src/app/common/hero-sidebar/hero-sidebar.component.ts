import {ChangeDetectionStrategy, Component} from '@angular/core';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-hero-sidebar',
  templateUrl: './hero-sidebar.component.html',
  styleUrls: ['./hero-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class HeroSidebarComponent {
  public externalName = this.constants.ExternalName;
  constructor(private constants: DoubtfireConstants) {}
}
