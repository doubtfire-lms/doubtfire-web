import {Component, Input, OnInit} from '@angular/core';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';
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
  public selectedProject: Project;

  constructor(
    private globalStateService: GlobalStateService,
    private unitService: UnitService,
    private projectService: ProjectService,
  ) {}

  ngOnInit(): void {
    this.unitService.get(this.unitId).subscribe({
      next: (unit) => {
        this.globalStateService.setView(ViewType.UNIT, unit);

        this.projectService.loadStudents(unit, false).subscribe({
          next: () => {
            console.log('got students');
            this.unit = unit;
          },
          error: (error) => {
            // TODO: redirect back to home..
            console.error(error);
          },
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
