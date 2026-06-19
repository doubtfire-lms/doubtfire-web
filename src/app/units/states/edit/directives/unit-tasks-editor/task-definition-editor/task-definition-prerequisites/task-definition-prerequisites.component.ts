import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {Observable, Subscription} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {TaskPrerequisite} from 'src/app/api/models/task-prerequisite';
import {TaskStatusEnum} from 'src/app/api/models/task-status';
import {Unit} from 'src/app/api/models/unit';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {TaskPrerequisiteService} from 'src/app/api/services/task-prerequisite.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-task-definition-prerequisites',
  templateUrl: 'task-definition-prerequisites.component.html',
  styleUrls: ['task-definition-prerequisites.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDefinitionPrerequisitesComponent implements OnInit, OnChanges {
  @Input() taskDefinition: TaskDefinition;
  @Input() staffView: boolean;
  @Input() task: Task;

  displayedColumns: string[] = ['task-definition', 'minimum-required-state', 'actions'];

  private prereqSub?: Subscription;

  public dataSource: MatTableDataSource<TaskPrerequisite> = new MatTableDataSource();

  selectedTaskPrerequisite: TaskDefinition | null = null;
  searchCtrl = new FormControl('');

  // All other task definitions in the unit (exclude the current one)
  filteredTaskDefs: TaskDefinition[] = [];

  public readonly STATES: Partial<Record<TaskStatusEnum, number>> = {
    ready_for_feedback: 1,
    assess_in_portfolio: 1,
    discuss: 2,
    attention_required: 0,
    demonstrate: 2,
    complete: 3,
  };

  public readonly stateOptions = [
    {value: 'ready_for_feedback', label: 'Ready for Feedback'},
    {value: 'discuss', label: 'Discuss'},
    {value: 'complete', label: 'Complete'},
  ];

  constructor(
    private taskDefinitionService: TaskDefinitionService,
    private alertService: AlertService,
    private taskPrerequisiteService: TaskPrerequisiteService,
  ) {}
  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  public get prerequisites(): Observable<TaskPrerequisite[]> {
    return this.taskDefinition.taskPrerequisitesCache.values;
  }

  ngOnInit(): void {
    this.searchCtrl.valueChanges.subscribe((value: string | TaskDefinition) => {
      const search = (typeof value === 'string' ? value : value?.name || '').toLowerCase();
      this.filterTaskDefs(search);
    });

    this.prereqSub = this.taskDefinition.taskPrerequisitesCache.values.subscribe((values) => {
      this.dataSource.data = values;
    });

    // this.fetchTaskPrerequisites();
  }

  private mapPrerequisites(taskDefinition: TaskDefinition) {
    const prerequisites = taskDefinition.taskPrerequisitesCache.currentValues;
    const definitions = taskDefinition.unit.taskDefinitions;
    for (const prerequisite of prerequisites) {
      prerequisite.taskDefinition = definitions.find(
        (td) => td.id === prerequisite.taskDefinitionId,
      );
      prerequisite.prerequisite = definitions.find((td) => td.id === prerequisite.prerequisiteId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.taskDefinition &&
      changes.taskDefinition.previousValue?.id !== changes.taskDefinition.currentValue?.id
    ) {
      this.filterTaskDefs(this.searchCtrl.value ?? '');
      this.prereqSub?.unsubscribe();
      this.prereqSub = this.taskDefinition.taskPrerequisitesCache.values.subscribe((values) => {
        this.dataSource.data = values;
      });
      this.fetchTaskPrerequisites();
    }
  }

  private fetchTaskPrerequisites() {
    const taskDefinition = this.taskDefinition;
    if (!taskDefinition.id) {
      return;
    }
    this.taskPrerequisiteService
      .query(
        {
          unitId: this.unit.id,
          taskDefId: taskDefinition.id,
        },
        {
          cache: taskDefinition.taskPrerequisitesCache,
        },
      )
      .subscribe({
        next: (data) => {
          for (const prereq of data) {
            if (prereq.taskDefinitionId !== taskDefinition.id) {
              continue;
            }
            taskDefinition.taskPrerequisitesCache.getOrCreate(
              prereq.id,
              this.taskPrerequisiteService,
              prereq,
            );
          }
          this.mapPrerequisites(taskDefinition);
          this.filterTaskDefs(this.searchCtrl.value ?? '');
        },
        error: (error) => {
          this.alertService.error(
            `Failed to fetch prerequisites for task definition: ${error}`,
            6000,
          );
        },
      });
  }

  private filterTaskDefs(search: string) {
    this.filteredTaskDefs = this.taskDefinition.unit.taskDefinitionCache.currentValues
      // Hide self from the list
      .filter((td) => td.id !== this.taskDefinition.id)
      // Hide tasks already added as a prerequisite
      .filter(
        (td) =>
          !this.taskDefinition.taskPrerequisitesCache.currentValues.some(
            (p: TaskPrerequisite) => p.prerequisite.id === td.id,
          ),
      )
      // Higher target grades can not be a prerequisite
      .filter((td) => td.targetGrade <= this.taskDefinition.targetGrade)
      // Tasks with a later due date can not be a prerequisite
      // .filter((td) => td.targetDate <= this.taskDefinition.targetDate)
      // Search filter
      .filter(
        (td) =>
          td.name.toLowerCase().includes(search) || td.abbreviation.toLowerCase().includes(search),
      );
  }

  displayFn(td: TaskDefinition): string {
    return td && td.abbreviation ? `${td.abbreviation} - ${td.name}` : '';
  }

  public addTaskPrerequisite(event: Event): void {
    event.stopPropagation();
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
          taskDefinition.taskPrerequisitesCache.getOrCreate(
            response.id,
            this.taskPrerequisiteService,
            response,
          );
          this.mapPrerequisites(taskDefinition);

          this.alertService.success(
            `Successfully added task ${selectedTaskPrerequisite.abbreviation} as a prerequisite`,
            5000,
          );
          this.unit.refresh();
          this.filterTaskDefs(this.searchCtrl.value ?? '');
        },
        error: (error) => {
          this.alertService.error(`Failed to add task prerequisite: ${error}`, 6000);
        },
      });
  }

  public updateTaskPrerequisite(prerequisiteLink: TaskPrerequisite) {
    this.taskDefinitionService
      .updateTaskPrerequisite(prerequisiteLink, prerequisiteLink.taskStatus)
      .subscribe({
        next: (response) => {
          if (!response) {
            this.alertService.error('Failed to update task prerequisite', 6000);
            return;
          }
          this.alertService.success(
            `Successfully updated prerequisite ${prerequisiteLink.prerequisite.abbreviation} to ${prerequisiteLink.taskStatus} `,
            5000,
          );
        },
        error: (error) => {
          this.alertService.error(`Failed to update task prerequisite: ${error}`, 6000);
        },
      });
  }

  public removePrerequisite(prerequisiteToRemove: TaskPrerequisite) {
    if (!prerequisiteToRemove) {
      return;
    }
    prerequisiteToRemove.delete().subscribe(() => {
      this.filterTaskDefs(this.searchCtrl.value ?? '');
    });
  }
}
