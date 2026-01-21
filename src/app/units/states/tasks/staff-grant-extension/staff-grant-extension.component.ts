import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Unit } from 'src/app/api/models/unit';
import { UnitRole } from 'src/app/api/models/unit-role';
import { TaskDefinition } from 'src/app/api/models/doubtfire-model';
import { GlobalStateService } from 'src/app/projects/states/index/global-state.service';
import { UIRouter } from '@uirouter/angular';
import { UnitService } from 'src/app/api/models/doubtfire-model';
import { ExtensionSummaryPayload } from 'src/app/units/states/tasks/staff-grant-extension/models/extension-results.model';
import { TasksViewerService } from '../tasks-viewer.service';

@Component({
  selector: 'f-staff-grant-extension',
  templateUrl: './staff-grant-extension.component.html',
  styleUrls: ['./staff-grant-extension.component.scss']
})
export class StaffGrantExtensionComponent implements OnInit, OnDestroy {
  @Input() unit?: Unit;
  @Input() unitRole?: UnitRole;

  selectedTaskDefinition: TaskDefinition | null = null;
  // selectedTaskDefinition$ = new BehaviorSubject<TaskDefinition | null>(null);
  isFormActive = false;
  unitId?: number;
  taskDefinitionId?: number;

  extensionSummary?: ExtensionSummaryPayload | null = null;
  showSummary = false;
  extensionSummaries = new Map<number, ExtensionSummaryPayload>();

  private destroy$ = new Subject<void>();

  constructor(
    private globalState: GlobalStateService,
    private router: UIRouter,
    private unitService: UnitService,
    private taskViewerService: TasksViewerService,
  ) {}

  ngOnInit(): void {
    // Subscribe to task definition selection changes
    this.taskViewerService.selectedTaskDef
      .pipe(takeUntil(this.destroy$))
      .subscribe(taskDef => {
        this.selectedTaskDefinition = taskDef;
        this.isFormActive = !!taskDef;

        if (taskDef) {
          this.taskDefinitionId = taskDef.id;
          const saved = this.extensionSummaries.get(taskDef.id);
          if (saved) {
            this.extensionSummary = saved;
            this.showSummary = true;
          } else {
            this.extensionSummary = null;
            this.showSummary = false;
          }
        } else {
          this.extensionSummary = null;
          this.showSummary = false;
        }
      });

    // Get current unit from global state
    this.globalState.currentViewAndEntitySubject$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
console.log('STATE ENTITY:', state.entity);
console.log('Is Unit?', state.entity instanceof Unit);
console.log('Is UnitRole?', state.entity instanceof UnitRole);
console.log('Constructor:', state.entity?.constructor?.name);
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

  // Called when child emits extensionResult
  onExtensionResult(payload: ExtensionSummaryPayload): void {
    const tdId = payload.taskDefinitionId ?? this.taskDefinitionId;
    if (!tdId) return;

    // Always clear the previous one
    this.extensionSummaries.delete(tdId);

    // Temporarily hide the summary
    this.extensionSummary = null;
    this.showSummary = false;


    // Save the payload for that specific task
    this.extensionSummaries.set(tdId, payload)

    if (this.selectedTaskDefinition && this.selectedTaskDefinition.id === tdId) {
    setTimeout(() => {
      this.extensionSummary = payload;
      this.showSummary = true;
    }, 0);
  }

  }

  onSummaryDismissed(): void {
    const tdId = this.extensionSummary?.taskDefinitionId ?? this.selectedTaskDefinition?.id;
    if (tdId) {
      this.extensionSummaries.delete(tdId);
    }

    this.showSummary = false;
    this.extensionSummary = null;
  }

  // Handle task selection from <f-unit-task-list>
  onTaskSelected(task: TaskDefinition): void {
    this.selectedTaskDefinition = task;
    // this.selectedTaskDefinition$.next(task);
    // this.taskDefinitionId = task.id;
  }

  // Helper: fetch unit and refresh taskDefinitions
  private loadUnit(unitId: number): void {
    if (!this.unitId || this.unitId !== unitId) {
      this.extensionSummaries.clear();
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
    // this.selectedTaskDefinition$.next(null);
    this.taskDefinitionId = undefined;
    this.isFormActive = false;

    this.extensionSummary = null;
    this.showSummary = false;
  }
}
