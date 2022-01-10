import { Component, Inject, Input, OnInit } from '@angular/core';
import { UIRouter } from '@uirouter/angular';
import { dateService, projectService, unitService } from 'src/app/ajs-upgraded-providers';
import { IsActiveUnitRole } from '../../pipes/is-active-unit-role.pipe';

@Component({
  selector: 'unit-dropdown',
  templateUrl: './unit-dropdown.component.html',
  styleUrls: ['./unit-dropdown.component.scss'],
})
export class UnitDropdownComponent implements OnInit {
  @Input() unit: any;
  unitRoles: any;
  projects: any;
  filteredRoles: any[];
  unitTitle: string;
  constructor(
    @Inject(dateService) private DateService: any,
    @Inject(unitService) private UnitService: any,
    @Inject(projectService) private ProjectService: any,
    private isActiveUnitRole: IsActiveUnitRole,
    private router: UIRouter,

  ) {
    this.UnitService.getUnitRoles((roles: any) => {
      this.unitRoles = roles;

      this.filteredRoles = this.isActiveUnitRole.transform(this.unitRoles);
      this.filteredRoles = this.filteredRoles.filter((role) => this.isUniqueRole(role));
    });

    this.ProjectService.getProjects(false, (projects: any) => {
      this.projects = projects;
    });

    this.router.transitionService
      .onSuccess(
        {
          to: 'home',
        },
        (trans) => {
          this.unit = null
        }
      )
  }


  isUniqueRole = (unit) => {
    let units = this.unitRoles.filter((role: any) => role.unit_id === unit.unit_id);
    return units.length == 1 || unit.role == 'Tutor';
  };

  ngOnInit(): void {}

  showDate = this.DateService.showDate;
}
