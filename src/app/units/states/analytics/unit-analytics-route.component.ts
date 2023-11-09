import { Component, Input } from '@angular/core';
import { Unit } from 'src/app/api/models/unit';

@Component({
  selector: 'f-unit-analytics',
  templateUrl: 'unit-analytics-route.component.html',
  styleUrls: ['unit-analytics-route.component.scss'],
})
export class UnitAnalyticsComponent {
  @Input() unit: Unit;
}
