import {Entity} from 'ngx-entity-service';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {TutorNoteService} from '../services/tutor-note.service';
import {Project, Task, TaskDefinition, UnitRole, User, UserService} from './doubtfire-model';

export class TutorNote extends Entity {
  id: number;

  unitRole: UnitRole;
  task?: Task;
  taskDefinition?: TaskDefinition;
  project?: Project;
  user: User;
  note: string;
  replyTo?: TutorNote;
  replyToId: number;
  readByUnitRole: boolean;
  requiresCurrentUserRead: boolean;

  createdAt: Date;
  updatedAt: Date;

  constructor(data?: UnitRole) {
    super();
    if (data) {
      this.unitRole = data;
    } else {
      console.error('Failed to get unit role');
    }
  }

  public get noteIsForMe(): boolean {
    const userService: UserService = AppInjector.get(UserService);
    return this.unitRole.user.id === userService.currentUser.id;
  }

  public get authorIsMe(): boolean {
    const userService: UserService = AppInjector.get(UserService);
    return this.user.id === userService.currentUser.id;
  }

  public delete() {
    const tutorNoteService: TutorNoteService = AppInjector.get(TutorNoteService);
    tutorNoteService
      .delete({unitRoleId: this.unitRole.id, id: this.id}, {cache: this.unitRole.tutorNotesCache})
      .subscribe({
        next: () => {
          AppInjector.get(AlertService).error('Successfully deleted tutor note', 4000);
        },
        error: (error) => {
          AppInjector.get(AlertService).error(error?.message || error || 'Unknown error', 2000);
        },
      });
  }
}
