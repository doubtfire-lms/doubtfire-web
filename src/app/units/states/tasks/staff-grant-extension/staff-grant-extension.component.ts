import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Unit } from 'src/app/api/models/unit';
import { UnitRole } from 'src/app/api/models/unit-role';
import { TaskDefinition } from 'src/app/api/models/doubtfire-model';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
import { UIRouter } from '@uirouter/angular';
import { UnitService } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-staff-grant-extension',
  templateUrl: './staff-grant-extension.component.html',
  styleUrls: ['./staff-grant-extension.component.scss']
})
export class StaffGrantExtensionComponent implements OnInit, OnDestroy {
  @Input() unit?: Unit;
  @Input() unitRole?: UnitRole;

  selectedTaskDefinition: TaskDefinition | null = null;
  selectedTaskDefinition$ = new BehaviorSubject<TaskDefinition | null>(null);
  isFormActive = false;
  private destroy$ = new Subject<void>();

  constructor(
    private globalState: GlobalStateService,
    private router: UIRouter,
    private unitService: UnitService
  ) {}

  //Temporary fix for the unit not being set (should be fixed by the backend intergration)
  ngOnInit(): void {
    // Subscribe to task definition selection changes
    this.selectedTaskDefinition$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(taskDef => {
      this.selectedTaskDefinition = taskDef;
      this.isFormActive = !!taskDef;
    });

    // Get current unit from global state
    this.globalState.currentViewAndEntitySubject$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      if (state && state.entity && state.entity instanceof Unit) {
        this.unit = state.entity;
      }
    });

    // If no unit in global state, try to get it from the current URL
    const currentUrl = this.router.globals.current.url;
    const unitMatch = currentUrl.match(/\/units\/(\d+)/);

    if (unitMatch && !this.unit) {
      const unitId = parseInt(unitMatch[1]);
      this.unitService.get(unitId).subscribe({
        next: (unit: Unit) => {
          this.unit = unit;
        },
        error: (err) => {
          console.error('Error loading unit:', err);
        }
      });
    }

    // If still no unit, try to get the first available unit for the user
    if (!this.unit) {
      this.globalState.unitRolesSubject.pipe(
        takeUntil(this.destroy$)
      ).subscribe(unitRoles => {
        if (unitRoles && unitRoles.length > 0 && !this.unit) {
          const firstUnitRole = unitRoles[0];
          this.unit = firstUnitRole.unit;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFormSubmitted(): void {
    this.isFormActive = false;
    this.selectedTaskDefinition = null;
    this.selectedTaskDefinition$.next(null);
  }
}
