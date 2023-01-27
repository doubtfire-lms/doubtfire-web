import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UIRouter } from '@uirouter/core';
import { Project, Unit, UnitRole } from 'src/app/api/models/doubtfire-model';
import { ViewType } from 'src/app/projects/states/index/global-state.service';
import { MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'task-dropdown',
  templateUrl: './task-dropdown.component.html',
  styleUrls: ['./task-dropdown.component.scss'],
})
export class TaskDropdownComponent implements OnDestroy, OnInit {
  currentActivity: string;
  menuText: string;
  private mediaSubscription: Subscription;
  @Input() data: { isTutor: boolean };
  @Input() currentUnit: Unit;
  @Input() currentProject: Project;
  @Input() currentView: ViewType;
  @Input() unitRole: UnitRole;

  taskToShortName: { [key: string]: string } = {
    'Learning Outcomes': 'Outcomes',
    'Mark Tasks Offline': 'Offline',
    'Portfolio Creation': 'Portfolio',
    'Staff Tasks': 'Staff Tasks',
    'Student Groups': 'Groups',
    'Student List': 'Students',
    'Student Plagiarism': 'Plagiarism',
    'Student Portfolios': 'Portfolios',
    'Task Explorer': 'Explorer',
    'Task Inbox': 'Inbox',
    'Task Lists': 'Tasks',
    'Tutorial List': 'Tutorials',
    'Unit Administration': 'Admin',
    'Unit Analytics': 'Analytics',
  };

  ngOnInit(): void {
    this.mediaSubscription = this.media.asObservable().subscribe((change) => {
      if (change.some((item) => item.mqAlias === 'xs')) {
        this.menuText = this.taskToShortName?.[this.currentActivity] ?? this.currentActivity;
      } else {
        this.menuText = this.currentActivity;
      }
    });
  }

  taskDropdownData: { title: string; target: string; visible: any }[];
  constructor(private router: UIRouter, private media: MediaObserver) {
    this.router.transitionService.onSuccess({ to: '**' }, (trans) => {
      this.currentActivity = trans.to().data.task;
      this.menuText =
        media.isActive('xs') && this.currentActivity in this.taskToShortName
          ? this.taskToShortName[this.currentActivity]
          : this.currentActivity;
    });
  }

  ngOnDestroy(): void {
    this.mediaSubscription.unsubscribe();
  }
}
