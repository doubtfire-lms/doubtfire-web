import {Location} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'unauthorised',
  templateUrl: 'unauthorised.component.html',
  styleUrls: ['unauthorised.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnauthorisedComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
