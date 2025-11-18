import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTabGroup} from '@angular/material/tabs';
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

  @ViewChild('tabs') tabs!: MatTabGroup;

  constructor(
    private globalStateService: GlobalStateService,
    private unitService: UnitService,
    private projectService: ProjectService,
  ) {}

  studentSelected(project: Project) {
    this.selectedProject = null;

    // TODO: add spinner while waiting for project to load
    this.projectService.loadProject(project, this.unit).subscribe({
      next: (project) => {
        this.selectedProject = project;
        this.tabs.selectedIndex = 1;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  ngOnInit(): void {
    // TODO: Unit and student loading needs to be moved to the parent controller (units/{unitId}) when everything is migrated
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
