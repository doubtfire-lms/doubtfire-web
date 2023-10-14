import { Component, Input, Inject, OnInit } from '@angular/core';
import { createUnitModal } from 'src/app/ajs-upgraded-providers';
import { Unit } from 'src/app/api/models/unit';
import { UnitRole } from 'src/app/api/models/unit-role';
import { GlobalStateService, ViewType } from 'src/app/projects/states/index/global-state.service';
import { UnitService } from 'src/app/api/services/unit.service';


@Component({
  selector: 'f-units',
  templateUrl: './f-units.component.html',
  styleUrls: ['./f-units.component.scss'],
})
export class FUnitsComponent implements OnInit {
  public allUnits: Unit[];
  unitRoles: UnitRole[];
  //dataload: boolean;

  constructor(
    @Inject(createUnitModal) private createUnitModal: any,
    private globalStateService: GlobalStateService,
    private unitService: UnitService
  ) {}

  ngOnInit() {
    this.globalStateService.setView(ViewType.OTHER);



    // Listen for units to be loaded
    this.globalStateService.onLoad(() => {
      const loadedUnitRoles = this.globalStateService.loadedUnitRoles.currentValues;
      this.unitRoles = [...loadedUnitRoles];

      this.globalStateService.loadedUnits.values.subscribe((units) => (this.allUnits = units));
      this.loadAllUnits();
    });


  }

  createUnit() {
    this.createUnitModal.show(this.allUnits);
  }

  private loadAllUnits() {
    // Load all units
    this.unitService.query(undefined, { params: { include_in_active: true } }).subscribe({
      next: (success) => {
        return;
      },
      error: (failure) => {
        //TODO: Add alert
        console.log(failure);
      },
    });
  }
}
