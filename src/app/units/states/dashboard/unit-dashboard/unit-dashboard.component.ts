import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  imports: [MatIconModule],
  selector: 'f-unit-dashboard',
  host: {
    class:
      'box-border flex min-h-[calc(100dvh-160px)] items-center justify-center px-4 py-6 sm:px-6 sm:py-8',
  },
  styleUrl: './unit-dashboard.component.css',
  templateUrl: './unit-dashboard.component.html',
})
export class UnitDashboardComponent {}
