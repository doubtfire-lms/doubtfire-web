/* eslint-disable @typescript-eslint/no-explicit-any */
import {Component, Inject, OnInit} from '@angular/core';

@Component({
  selector: 'f-units-index',
  templateUrl: './index.component.html',
})
export class IndexComponent implements OnInit {
  // Variables that replace $scope
  unitRole: any;
  unit: any;
  unitId!: number;
  project: any;

  constructor(
    @Inject('$state') private $state: any,
    @Inject('$stateParams') private $stateParams: any,
    @Inject('newUnitService') private newUnitService: any,
    @Inject('newProjectService') private newProjectService: any,
    @Inject('listenerService') private listenerService: any,
    @Inject('GlobalStateService') private globalStateService: any,
    @Inject('newUserService') private newUserService: any,
    @Inject('alertService') private alertService: any,
  ) {}

  ngOnInit(): void {
    // Get unitId from URL params
    this.unitId = +this.$stateParams.unitId;

    // If no unitId → redirect to home
    if (!this.unitId) {
      this.$state.go('home');
      return;
    }

    // Wait for global state to load
    this.globalStateService.onLoad(() => {
      // Find the role for this unit
      this.unitRole =
        this.globalStateService.loadedUnitRoles.currentValues.find(
          (unitRole: any) => unitRole.unit.id === this.unitId,
        );

      // Admin / Auditor fallback
      if (
        !this.unitRole &&
        (this.newUserService.currentUser.role === 'Admin' ||
          this.newUserService.currentUser.role === 'Auditor')
      ) {
        this.unitRole = this.newUserService.adminOrAuditorRoleFor(
          this.newUserService.currentUser.role,
          this.unitId,
          this.newUserService.currentUser,
        );
      }

      // If still no role, redirect to home
      if (!this.unitRole) {
        this.$state.go('home');
        return;
      }

      // Set the app to "UNIT view"
      this.globalStateService.setView('UNIT', this.unitRole);

      // Load the unit and students
      this.newUnitService.get(this.unitId).subscribe({
        next: (unit: any) => {
          this.newProjectService.loadStudents(unit).subscribe({
            next: (_students: any) => {
              this.unit = unit;
            },
            error: (err: any) => {
              this.alertService.error(
                'Error loading students: ' + err,
                8000,
              );
              setTimeout(() => this.$state.go('home'), 5000);
            },
          });
        },
        error: (err: any) => {
          this.alertService.error('Error loading unit: ' + err, 8000);
          setTimeout(() => this.$state.go('home'), 5000);
        },
      });
    });
  }
}
