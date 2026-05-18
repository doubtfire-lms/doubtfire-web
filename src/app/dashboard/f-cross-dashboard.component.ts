import {Component, OnInit} from '@angular/core';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {Project} from '../api/models/project';
import {TaskStatus} from '../api/models/task-status';
import {DashboardTask} from './dashboard-list-item.component';
import {Task} from '../api/models/task';
import {TaskDefinition} from '../api/models/task-definition';

type DashboardUnit = {
  projectId: number;
  code: string;
  name: string;
  tasks: DashboardTask[];
};

@Component({
  selector: 'f-cross-dashboard',
  templateUrl: './f-cross-dashboard.component.html',
})
export class CrossDashboardComponent implements OnInit {
  constructor(private globalStateService: GlobalStateService) {}

  units: DashboardUnit[] = [];

  ngOnInit(): void {
    this.globalStateService.onLoad(() => {
      this.globalStateService.currentUserProjects.values.subscribe((projects) => {
        this.units = this.mapProjects(projects);
      });
    });
  }

  mapProjects(projects: readonly Project[]): DashboardUnit[] {
    return projects.map((project) => {
      const unit = project.unit;
      return {
        projectId: project.id,
        code: unit.code,
        name: unit.name,
        tasks: this.mapTasks(project.tasks, unit.taskDefinitions),
      };
    });
  }

  mapTasks(tasks: readonly Task[], taskDefs: readonly TaskDefinition[]): DashboardTask[] {
    return taskDefs.map((def) => {
      const task = tasks.find((t) => t.taskDefId == def.id);
      return {
        title: def.name,
        subtitle: `${def.abbreviation} - ${def.targetGradeText} Task`,
        abbreviation: def.abbreviation,
        color: TaskStatus.STATUS_COLORS.get(task?.status ?? 'not_started'),
        comments: task?.numNewComments ?? 0,
      };
    });
  }
}
