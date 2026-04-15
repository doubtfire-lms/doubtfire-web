import { Component } from '@angular/core';

@Component({
  selector: 'peer-progress',
  templateUrl: './peer-progress.component.html',
  styleUrls: ['./peer-progress.component.scss'],
})
export class PeerProgressComponent {
  // Mock data for now – replace with API calls later
  tasks = ['1.1P', '1.2P', '2.1P', '2.2C', '3.1P', '3.2D', '4.1P'];
  progressSummary = {
    completed: 7,
    total: 10,
    classAverage: 5.8,
    percentile: 'Top 25%',
    band: 'Above Avg',
  };
  distribution = [
    { band: 'High Distinction', pct: 15 },
    { band: 'Above Average', pct: 30 },
    { band: 'Average', pct: 35 },
    { band: 'Below Average', pct: 20 },
  ];
  privacy = { share: true, view: true };
}
