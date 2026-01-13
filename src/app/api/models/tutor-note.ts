import {Entity} from 'ngx-entity-service';
import {Project, Unit, User, UserService, Task, UnitRole, TaskDefinition} from './doubtfire-model';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {StaffNoteService} from '../services/staff-note.service';
import {TutorNoteService} from '../services/tutor-note.service';

export class TutorNote extends Entity {
  id: number;

  // project: Project;
  unitRole: UnitRole;
  task?: Task;
  taskDefinition?: TaskDefinition;
  project?: Project;
  user: User;
  note: string;
  replyTo?: TutorNote;
  replyToId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data?: UnitRole) {
    super();
    if (data) {
      this.unitRole = data;
    } else {
      console.error('Failed to get project');
    }
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
        next: (response: object) => {
          AppInjector.get(AlertService).error('Successfully deleted tutor note', 4000);
          // this.project.staffNoteCount--;
          // staffNoteService.updateStaffNoteReplies(this.project.staffNoteCache.currentValues);
        },
        error: (error) => {
          AppInjector.get(AlertService).error(error?.message || error || 'Unknown error', 2000);
        },
      });
  }
}
