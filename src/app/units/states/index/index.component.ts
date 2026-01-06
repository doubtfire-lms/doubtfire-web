/* eslint-disable @typescript-eslint/no-explicit-any */
import {Component, Inject, OnInit} from '@angular/core';
import {StateService, UIRouterGlobals} from '@uirouter/angular';

@Component({
  selector: 'f-units-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  unitRole: any;
  unit: any;
  unitId!: number;
  project: any;

  constructor(
    private state: StateService,
    private globals: UIRouterGlobals,

    // These are still AngularJS services in the hybrid app, so inject by string token:
    @Inject('GlobalStateService') private globalStateService: any,
    @Inject('newUserService') private newUserService: any,
    @Inject('newUnitService') private newUnitService: any,
    @Inject('newProjectService') private newProjectService: any,
    @Inject('alertService') private alertService: any,
  ) {}

  ngOnInit(): void {
    // Get unitId from URL params
    this.unitId = +this.globals.params['unitId'];

    // If no unitId → redirect to home
    if (!this.unitId) {
      this.state.go('home');
      return;
    }

    // Wait for global state to load (same behaviour as old Coffee/AngularJS)
    this.globalStateService.onLoad(() => {
      // Find the role for this unit
      this.unitRole =
        this.globalStateService.loadedUnitRoles?.currentValues?.find(
          (unitRole: any) => unitRole?.unit?.id === this.unitId,
        );

      // Admin / Auditor fallback
      if (
        !this.unitRole &&
        (this.newUserService?.currentUser?.role === 'Admin' ||
          this.newUserService?.currentUser?.role === 'Auditor')
      ) {
        this.unitRole = this.newUserService.adminOrAuditorRoleFor(
          this.newUserService.currentUser.role,
          this.unitId,
          this.newUserService.currentUser,
        );
      }

      // If still no role, redirect to home
      if (!this.unitRole) {
        this.state.go('home');
        return;
      }

      // Set the app to "UNIT view"
      this.globalStateService.setView('UNIT', this.unitRole);

      // Load the unit and students (same as old behaviour)
      this.newUnitService.get(this.unitId).subscribe({
        next: (unit: any) => {
          this.newProjectService.loadStudents(unit).subscribe({
            next: () => {
              this.unit = unit;
            },
            error: (err: any) => {
              this.alertService.error('Error loading students: ' + err, 8000);
              setTimeout(() => this.state.go('home'), 5000);
            },
          });
        },
        error: (err: any) => {
          this.alertService.error('Error loading unit: ' + err, 8000);
          setTimeout(() => this.state.go('home'), 5000);
        },
      });
    });
  }
}
