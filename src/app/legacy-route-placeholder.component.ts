import {Component} from '@angular/core';

@Component({
  selector: 'legacy-route-placeholder',
  templateUrl: './legacy-route-placeholder.component.html',
  styles: [
    `
      :host {
        display: none;
      }
    `,
  ],
  standalone: false,
})
export class LegacyRoutePlaceholderComponent {}
