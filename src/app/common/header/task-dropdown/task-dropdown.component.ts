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
  currentActivity: string;
  menuText: string;
  @Input() data: { isTutor: boolean };
  @Input() currentUnit: Unit;
  @Input() currentProject: Project;
  @Input() currentView: ViewType;
  @Input() unitRole: UnitRole;

  taskToShortName: { [key: string]: string } = {
    'Learning Outcomes': 'Outcomes',
    'Portfolio Creation': 'Portfolio',
    'Staff Tasks': 'Staff Tasks',
    'Student Groups': 'Groups',
    'Student List': 'Students',
    'Student Plagiarism': 'Plagiarism',
    'Student Portfolios': 'Portfolios',
    'Task Explorer': 'Task Explorer',
    'Task Inbox': 'Inbox',
    'Task Lists': 'Tasks',
    'Tutorial List': 'Tutorials',
    'Unit Administration': 'Admin',
    'Unit Analytics': 'Analytics',
  };

  taskDropdownData: { title: string; target: string; visible: any }[];
  constructor(private router: UIRouter) {
    this.router.transitionService.onSuccess({ to: '**' }, (trans) => {
      this.currentActivity = trans.to().data.task;
      this.menuText = this.taskToShortName?.[this.currentActivity] ?? this.currentActivity;
    });
  }

}
