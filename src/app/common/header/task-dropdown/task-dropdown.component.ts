import { Component, Input } from '@angular/core';
import { UIRouter } from '@uirouter/core';
import { Project, Unit, UnitRole } from 'src/app/api/models/doubtfire-model';
import { ViewType } from 'src/app/projects/states/index/global-state.service';

@Component({
  selector: 'task-dropdown',
  templateUrl: './task-dropdown.component.html',
  styleUrls: ['./task-dropdown.component.scss'],
})
export class TaskDropdownComponent {
  currentActivity: any;
  @Input() data: { isTutor: boolean };
  @Input() currentUnit: Unit;
  @Input() currentProject: Project;
  @Input() currentView: ViewType;
  @Input() unitRole: UnitRole;

  taskDropdownData: { title: string; target: string; visible: any }[];
  constructor(private router: UIRouter) {
    this.router.transitionService.onSuccess({ to: '**' }, (trans) => {
      this.currentActivity = trans.to().data.task;
    });
  }
}
