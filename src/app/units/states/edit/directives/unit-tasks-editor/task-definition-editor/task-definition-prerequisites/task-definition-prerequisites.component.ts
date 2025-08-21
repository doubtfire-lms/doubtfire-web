import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-task-definition-prerequisites',
  templateUrl: 'task-definition-prerequisites.component.html',
  styleUrls: ['task-definition-prerequisites.component.scss'],
})
export class TaskDefinitionPrerequisitesComponent implements OnInit {
  @Input() taskDefinition: TaskDefinition;
  @Input() editingMode: boolean;
  @Input() task: Task;

  selectedTaskPrerequisite: TaskDefinition | null = null;
  searchCtrl = new FormControl('');

  // All other task definitions in the unit (exclude the current one)
  filteredTaskDefs: TaskDefinition[] = [];

  constructor(
    private taskDefinitionService: TaskDefinitionService,
    private alertService: AlertService,
  ) {}
  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  public get prerequisites(): Observable<TaskDefinition[]> {
    return this.taskDefinition.taskPrerequisitesCache.values;
  }

  ngOnInit(): void {
    this.searchCtrl.valueChanges.subscribe((value: string | TaskDefinition) => {
      const search = (typeof value === 'string' ? value : value?.name || '').toLowerCase();

      this.filteredTaskDefs = this.taskDefinition.unit.taskDefinitionCache.currentValues
        // Hide self from the list
        .filter((td) => td.id !== this.taskDefinition.id)
        // Hide tasks already added as a prerequisite
        .filter(
          (td) =>
            !this.taskDefinition.taskPrerequisitesCache.currentValues.some((p) => p.id === td.id),
        )
        // Higher target grades can not be a prerequisite
        .filter((td) => td.targetGrade <= this.taskDefinition.targetGrade)
        // Search filter
        .filter(
          (td) =>
            td.name.toLowerCase().includes(search) ||
            td.abbreviation.toLowerCase().includes(search),
        );
    });
  }

  displayFn(td: TaskDefinition): string {
    return td && td.abbreviation ? `${td.abbreviation} - ${td.name}` : '';
  }

  public addTaskPrerequisite(): void {
    const taskDefinition = this.taskDefinition;
    const selectedTaskPrerequisite = this.selectedTaskPrerequisite;

    this.selectedTaskPrerequisite = null;

    if (!taskDefinition) {
      return this.alertService.error('Invalid task definition', 6000);
    }

    if (!selectedTaskPrerequisite) {
      return this.alertService.error(
        'Please select a task definition to add as a prerequisite',
        6000,
      );
    }

    this.taskDefinitionService
      .addTaskPrerequisite(taskDefinition, selectedTaskPrerequisite)
      .subscribe({
        next: (response) => {
          if (!response) {
            this.alertService.error('Failed to add task prerequisite', 6000);
            return;
          }
          this.alertService.success(
            `Successfully added task ${selectedTaskPrerequisite.abbreviation} as a prerequisite`,
            5000,
          );
          this.unit.refresh();
        },
        error: (error) => {
          this.alertService.error(`Failed to add task prerequisite: ${error}`, 6000);
        },
      });
  }

  public removePrerequisite(taskDefToRemove: TaskDefinition) {
    if (!taskDefToRemove) {
      return;
    }

    this.taskDefinitionService
      .removeTaskPrerequisite(this.taskDefinition, taskDefToRemove)
      .subscribe({
        next: (response) => {
          if (!response) {
            this.alertService.error('Failed to remove task prerequisite', 6000);
            return;
          }
          this.alertService.success(
            `Removed task ${taskDefToRemove.abbreviation} as a prerequisite`,
            5000,
          );
          this.unit.refresh();
        },
        error: (error) => {
          this.alertService.error(`Failed to remove task prerequisite: ${error}`, 6000);
        },
      });
  }
}
