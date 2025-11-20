import {AfterViewInit, Component, OnInit} from '@angular/core';
import {
  GanttDate,
  GanttItem,
  GanttItemType,
  GanttViewOptions,
  GanttViewType,
} from '@worktile/gantt';
import {Project, TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {GradeService} from 'src/app/common/services/grade.service';
import {GlobalStateService} from '../index/global-state.service';
import {TaskPrerequisiteService} from 'src/app/api/services/task-prerequisite.service';

@Component({
  selector: 'f-project-plan',
  templateUrl: 'project-plan.component.html',
  // styleUrls: ['project-plan.component.scss']
})
export class ProjectPlanComponent implements OnInit, AfterViewInit {
  public project: Project;

  // @ViewChild('gantt') ganttComponent: NgxGanttComponent;

  public viewType: GanttViewType = GanttViewType.day;

  viewOptions: GanttViewOptions;
  constructor(
    private globalStateService: GlobalStateService,
    private gradeService: GradeService,
    private taskPrerequisiteService: TaskPrerequisiteService,
  ) {
    this.globalStateService.currentViewAndEntitySubject$.subscribe((viewAndEntity) => {
      if (viewAndEntity.viewType === 'PROJECT' && viewAndEntity.entity) {
        this.project = viewAndEntity.entity as Project;
      }
    });
  }
  ngAfterViewInit(): void {
    console.log();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    console.log(this.project.unit.startDate, this.project.unit.endDate);
    this.viewOptions = {
      datePrecisionUnit: 'day',
      start: new GanttDate(this.project.unit.startDate.getTime() / 1000),
      end: new GanttDate(this.project.unit.endDate.getTime() / 1000),
      dragPreviewDateFormat: 'MMM Do',
    };

    const newItems: GanttItem[] = [];

    this.items = [];
    const unit = this.project.unit;
    const taskDefinitions = unit.taskDefinitions;
    for (const td of taskDefinitions) {
      this.taskPrerequisiteService
        .query(
          {
            unitId: this.project.unit.id,
            taskDefId: td.id,
          },
          {
            cache: td.taskPrerequisitesCache,
          },
        )
        .subscribe({
          next: (data) => {
            console.log(data);
            const task = this.project.findTaskForDefinition(td.id) ?? td;

            const item: GanttItem = {
              id: td.id.toString(),
              title: `${td.abbreviation} ${td.name}`,
              start: Math.floor(task.startDate.getTime() / 1000),
              end: Math.floor(task.localDeadlineDate().getTime() / 1000),
              expandable: false,
              draggable: true,
              // color: this.gradeService.gradeColors[td.targetGrade],
              expanded: false,
              links: data.map((dataItem) => dataItem.prerequisiteId.toString()),
              // type: GanttItemType.bar,
              // links: [(td.id - 1).toString()],
            };

            console.log(
              `${td.abbreviation} has prerequiites: ${data.map((dataItem) => dataItem.prerequisiteId.toString())}`,
            );
            this.items.push(item);
            this.items = [...this.items];
            console.log(item);
          },
        });

      // newItems.push(item);
      // console.log(item);
    }

    // this.items = [...newItems];
  }

  items: GanttItem[] = [];

  public taskDefs(): TaskDefinition[] {
    if (!this.project || !this.project.unit.taskDefinitions) {
      return [];
    }

    return this.project.unit.taskDefinitions.filter((taskDef) => {
      return taskDef.targetGrade <= this.project.targetGrade;
    });
  }
}
