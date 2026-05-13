import {Component} from '@angular/core';

@Component({
    selector: 'legacy-route-placeholder',
    template: '',
    styles: [
        `
      :host {
        display: none;
      }
    `,
    ],
    standalone: false
})
export class LegacyRoutePlaceholderComponent {}
