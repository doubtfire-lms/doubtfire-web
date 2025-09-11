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
  unitId?: number;
  taskDefinitionId?: number;

  private destroy$ = new Subject<void>();

  constructor(
    private globalState: GlobalStateService,
    private router: UIRouter,
    private unitService: UnitService
  ) { }

  ngOnInit(): void {
    // Subscribe to task definition selection changes
    this.selectedTaskDefinition$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(taskDef => {
      this.selectedTaskDefinition = taskDef;
      this.isFormActive = !!taskDef;

      if (taskDef) {
        this.taskDefinitionId = taskDef.id;
      }
    });

    // Get current unit from global state
    this.globalState.currentViewAndEntitySubject$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      if (state && state.entity) {
        let newUnit: Unit | undefined;

        // Handle both cases: Unit OR UnitRole
        if (state.entity instanceof Unit) {
          newUnit = state.entity;
        } else if (state.entity instanceof UnitRole) {
          newUnit = state.entity.unit;
        }

        if (newUnit) {
          this.loadUnit(newUnit.id);
        }
      }
    });

    // If no unit in global state, try to get it from the current URL
    const currentUrl = this.router.globals.current.url;
    const unitMatch = currentUrl.match(/\/units\/(\d+)/);

    if (unitMatch) {
      const unitId = parseInt(unitMatch[1]);
      this.loadUnit(unitId);
    }

    // If still no unit, try to get the first available unit for the user
    if (!this.unit) {
      this.globalState.unitRolesSubject.pipe(
        takeUntil(this.destroy$)
      ).subscribe(unitRoles => {
        if (unitRoles && unitRoles.length > 0 && !this.unit) {
          const firstUnitRole = unitRoles[0];
          this.unit = firstUnitRole.unit;
          this.unitId = this.unit.id;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFormSubmitted(): void {
    this.resetFormState();
  }

  // Handle task selection from <f-unit-task-list>
  onTaskSelected(task: TaskDefinition): void {
    this.selectedTaskDefinition = task;
    this.selectedTaskDefinition$.next(task);
    this.taskDefinitionId = task.id;
  }

  // Helper: fetch unit and refresh taskDefinitions
  private loadUnit(unitId: number): void {
    if (!this.unitId || this.unitId !== unitId) {
      this.unitId = unitId;
      this.unitService.get(unitId).subscribe({
        next: (fresh: Unit) => {
          this.unit = fresh; // includes updated taskDefinitions
          this.resetFormState();
        },
        error: (err) => {
          console.error('Error loading unit:', err);
        }
      });
    }
  }

  private resetFormState(): void {
    this.selectedTaskDefinition = null;
    this.selectedTaskDefinition$.next(null);
    this.taskDefinitionId = undefined;
    this.isFormActive = false;
  }
}
