import {Component, Input, OnInit} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';
import {UnitService} from 'src/app/api/services/unit.service';
import {GlobalStateService, ViewType} from 'src/app/projects/states/index/global-state.service';

@Component({
  selector: 'f-portfolios',
  templateUrl: './portfolios.component.html',
  styleUrl: './portfolios.component.scss',
})
export class PortfoliosComponent implements OnInit {
  // Passed from doubtfire.states.ts
  @Input() unitId: number;

  // Exposed to child components
  public unit: Unit = null;

  constructor(
    private globalStateService: GlobalStateService,
    private unitService: UnitService,
  ) {}

  ngOnInit(): void {
    this.unitService.get(this.unitId).subscribe({
      next: (unit) => {
        this.unit = unit;
        this.globalStateService.setView(ViewType.UNIT, this.unit);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
