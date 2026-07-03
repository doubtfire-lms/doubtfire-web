import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'f-unavailable-card',
  templateUrl: './unavailable-card.component.html',
  styleUrls: ['./unavailable-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatCard, MatIcon],
})
export class UnavailableCardComponent {}
