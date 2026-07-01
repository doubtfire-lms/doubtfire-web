import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';
import {Project, Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {ViewType} from 'src/app/projects/states/index/global-state.service';
import {TutorNotesModalService} from '../../modals/tutor-notes-modal/tutor-notes-modal.service';

@Component({
  selector: 'task-dropdown',
  templateUrl: './task-dropdown.component.html',
  styleUrls: ['./task-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDropdownComponent {
  currentActivity: string;
  menuText: string;
  @Input() data: {isTutor: boolean};
  @Input() currentUnit: Unit;
  @Input() currentProject: Project;
  @Input() currentView: ViewType;
  @Input() unitRole: UnitRole;

  taskToShortName: Record<string, string> = {
    'Portfolio Creation': 'Portfolio',
    'Staff Tasks': 'Staff Tasks',
    'Student Groups': 'Groups',
    'Student List': 'Students',
    'Student Portfolios': 'Portfolios',
    'Task Explorer': 'Task Explorer',
    'Task Moderation': 'Task Moderation',
    'Task Overflow': 'Task Overflow',
    'Task Inbox': 'Inbox',
    'Task Lists': 'Tasks',
    'Tutorial List': 'Tutorials',
    'Unit Administration': 'Admin',
    'Unit Analytics': 'Analytics',
  };

  taskDropdownData: {title: string; target: string; visible: boolean}[];
  constructor(
    private angularRouter: Router,
    private route: ActivatedRoute,
    private tutorNotesModal: TutorNotesModalService,
  ) {
    this.angularRouter.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.setCurrentActivityFromAngularRoute());
    this.setCurrentActivityFromAngularRoute();
  }

  public get canMarkOverflowTask() {
    // this.unitRole does not have permission-based fields exposed such as canMarkOverflowTasks
    // so we must access them via the unit data
    const staff = this.currentUnit.staff.find((ur) => ur.id === this.unitRole.id);
    return staff?.canMarkOverflowTasks;
  }

  public get isMentor(): boolean {
    return this.currentUnit.staff.some((ur) => ur.mentorId === this.unitRole.id);
  }

  openTutorNotes() {
    this.tutorNotesModal.show(null, this.unitRole);
  }

  private setCurrentActivityFromAngularRoute(): void {
    let route = this.route.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    this.currentActivity = route.snapshot.data.task;
    this.menuText = this.taskToShortName?.[this.currentActivity] ?? this.currentActivity;
  }
}
