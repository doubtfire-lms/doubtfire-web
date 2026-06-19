import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'legacy-route-placeholder',
  templateUrl: './legacy-route-placeholder.component.html',
  styleUrl: './legacy-route-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class LegacyRoutePlaceholderComponent {}
