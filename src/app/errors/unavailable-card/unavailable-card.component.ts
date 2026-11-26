import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'f-unavailable-card',
  templateUrl: './unavailable-card.component.html',
  styleUrls: ['./unavailable-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnavailableCardComponent {}
