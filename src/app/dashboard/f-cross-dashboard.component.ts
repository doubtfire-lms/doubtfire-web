import {Component, OnInit} from '@angular/core';
import {Unit} from 'src/app/api/models/unit';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';

type IUnits = {
  id: number;
  code: string;
  name: string;
  // tasks: ITask[];
};

@Component({
  selector: 'f-cross-dashboard',
  templateUrl: './f-cross-dashboard.component.html',
  styleUrls: ['./f-cross-dashboard.component.scss'],
})
export class CrossDashboardComponent implements OnInit {
  constructor(private globalStateService: GlobalStateService) {}

  units: IUnits[] = [];

  ngOnInit(): void {
    this.globalStateService.onLoad(() => {
      this.globalStateService.loadedUnits.values.subscribe((units) => {
        this.units = this.mapUnits(units);
      });
    });
  }

  mapUnit(unit: Unit): IUnits {
    return {
      id: unit.id,
      code: unit.code,
      name: unit.name,
    };
  }

  mapUnits(units: readonly Unit[]) {
    return units.map((unit) => this.mapUnit(unit));
  }
}
