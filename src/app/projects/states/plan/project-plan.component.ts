import {AfterViewInit, Component, OnInit} from '@angular/core';
import {
  GanttDate,
  GanttDragEvent,
  GanttItem,
  GanttLink,
  GanttLinkType,
  GanttViewOptions,
  GanttViewType,
} from '@worktile/gantt';
import {Project, TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {TaskPrerequisiteService} from 'src/app/api/services/task-prerequisite.service';
import {GradeService} from 'src/app/common/services/grade.service';
import {GlobalStateService} from '../index/global-state.service';
import {TaskPrerequisite} from 'src/app/api/models/task-prerequisite';

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

  public showDatesColumn: boolean = false;

  onDragStarted(event: GanttDragEvent) {
    console.log('drag started', event);
    console.log(
      new Date(event.item.start * 1000).toLocaleDateString(),
      new Date(event.item.end * 1000).toLocaleDateString(),
    );
  }

  onDragEnded(event: GanttDragEvent) {
    console.log('drag ended', event);
    console.log(
      new Date(event.item.start * 1000).toLocaleDateString(),
      new Date(event.item.end * 1000).toLocaleDateString(),
    );

    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(event.item.id));

    console.log(event.item.end, td.localDeadlineDate().getTime() / 1000);
    if (event.item.end > td.localDeadlineDate().getTime() / 1000) {
      alert('Your selected date is past the feedback deadline...');
    }
  }

  toDateString(timestamp: number | Date) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000);
    return date.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getTaskDeadline(tdId: string) {
    const td = this.project.unit.taskDefinitions.find((td) => td.id === Number(tdId));
    return td?.localDeadlineDate() ?? 'N/A';
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    console.log(this.project.unit.startDate, this.project.unit.endDate);
    this.viewOptions = {
      datePrecisionUnit: 'day',
      start: new GanttDate(this.project.unit.startDate.getTime() / 1000),
      end: new GanttDate(this.project.unit.endDate.getTime() / 1000),
      dragPreviewDateFormat: 'MMM dd',
    };

    const newItems: GanttItem[] = [];

    this.items = [];
    const unit = this.project.unit;
    const taskDefinitions = unit.taskDefinitions;

    this.project.unit.getTaskPrerequisites().subscribe({
      next: (prereqs) => {
        const taskPrerequisites: TaskPrerequisite[] = prereqs;
        console.log(taskPrerequisites);
        for (const td of taskDefinitions) {
          const task = this.project.findTaskForDefinition(td.id) ?? td;
          const item: GanttItem = {
            id: td.id.toString(),
            title: `${td.abbreviation} ${td.name}`,
            start: Math.floor(task.startDate.getTime() / 1000),
            end: Math.floor(task.localDueDate().getTime() / 1000),
            expandable: false,
            draggable: true,
            // color: this.gradeService.gradeColors[td.targetGrade],
            expanded: false,
            links: taskPrerequisites
              // .filter((p) => p.prerequisiteId === td.id)
              .filter((p) => p.taskDefinitionId === td.id)
              .map((p) => {
                let color: string;

                switch (p.taskStatus) {
                  case 'ready_for_feedback':
                    color = '#0079D8';
                    break;
                  case 'complete':
                    color = '#5BB75B';
                    break;
                  case 'discuss':
                    color = '#31b0d5';
                    break;
                  case 'demonstrate':
                    color = '#31b0d5';
                    break;
                  default:
                    color = 'gray';
                }

                const link: GanttLink = {
                  type: GanttLinkType.fs,
                  // link: p.taskDefinitionId.toString(),
                  link: p.prerequisiteId.toString(),
                  color: {
                    default: color,
                    active: 'red',
                  },
                };

                return link;
              }),
            // .map((dataItem) => dataItem.taskDefinitionId.toString()),
            // type: GanttItemType.bar,
            // links: [(td.id - 1).toString()],
          };
          // if()
          this.items.push(item);
          this.items = [...this.items];

          // newItems.push(item);
          // console.log(item);
        }
      },
      error: (error) => {
        console.error(error);
      },
    });

    // this.items = [...newItems];
  }

  items: GanttItem[] = [];

  getstuff() {
    console.log(JSON.stringify(this.items));
  }

  public taskDefs(): TaskDefinition[] {
    if (!this.project || !this.project.unit.taskDefinitions) {
      return [];
    }

    return this.project.unit.taskDefinitions.filter((taskDef) => {
      return taskDef.targetGrade <= this.project.targetGrade;
    });
  }
}
