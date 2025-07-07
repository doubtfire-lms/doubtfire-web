import {Component} from '@angular/core';
import {GlobalStateService} from '../index/global-state.service';
import { Project, TaskDefinition } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-project-plan',
  templateUrl: 'project-plan.component.html',
  // styleUrls: ['project-plan.component.scss']
})
export class ProjectPlanComponent {
  public project: Project;

  constructor(private globalStateService: GlobalStateService) {
    this.globalStateService.currentViewAndEntitySubject$.subscribe((viewAndEntity) => {
      if (viewAndEntity.viewType === 'PROJECT' && viewAndEntity.entity) {
        this.project = viewAndEntity.entity as Project;
      }
    });
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
