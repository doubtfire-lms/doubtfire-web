import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'achievement-box-plot',
  templateUrl: './achievement-box-plot.component.html',
  styleUrls: ['./achievement-box-plot.component.scss'],
})
export class AchievementBoxPlotComponent implements OnInit {
  @Input() data: any;
  @Input() unit: any;
  @Input() type: any;
  @Input() pctHolder: any;
  @Input() height: any;
  @Input() showLegend: any;

  constructor() {}

  ngOnInit(): void {}

  press() {
    console.log(this.data);
    console.log(this.unit);
    console.log(this.type);
    console.log(this.pctHolder);
    console.log(this.height);
    console.log(this.showLegend);
  }
}
