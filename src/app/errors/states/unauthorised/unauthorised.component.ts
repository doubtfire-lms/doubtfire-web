import {Location} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'unauthorised',
  templateUrl: 'unauthorised.component.html',
  styleUrls: ['unauthorised.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, MatButton],
})
export class UnauthorisedComponent {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
