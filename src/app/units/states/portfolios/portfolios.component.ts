import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTabGroup} from '@angular/material/tabs';
import {StateService} from '@uirouter/core';
import {Project} from 'src/app/api/models/project';
import {Unit} from 'src/app/api/models/unit';
import {ProjectService} from 'src/app/api/services/project.service';
import {UnitService} from 'src/app/api/services/unit.service';
import {AlertService} from 'src/app/common/services/alert.service';
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
    private stateService: StateService,
    private alertService: AlertService,
  ) {}

  studentSelected(project: Project) {
    this.selectedProject = null;

    this.projectService.loadProject(project, this.unit).subscribe({
      next: (project) => {
        this.selectedProject = project;
        this.tabs.selectedIndex = 1;
      },
      error: (error) => {
        this.alertService.error(`Failed to load project: ${error}`, 6000);
        console.error(error);
      },
    });
  }

  ngOnInit(): void {
    // TODO 10.0.x: Unit and student loading needs to be moved to the parent controller (units/{unitId}) when everything is migrated
    this.unitService.get(this.unitId).subscribe({
      next: (unit) => {
        this.globalStateService.setView(ViewType.UNIT, unit);

        this.projectService.loadStudents(unit, false).subscribe({
          next: () => {
            this.unit = unit;
          },
          error: (error) => {
            this.alertService.error(`Failed to load unit: ${error}`, 6000);
            this.stateService.go('home');
          },
        });
      },
      error: (error) => {
        this.alertService.error(`Failed to load unit: ${error}`, 6000);
        this.stateService.go('home');
      },
    });
  }
}
