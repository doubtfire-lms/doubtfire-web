import {Entity} from 'ngx-entity-service';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {StaffNoteService} from '../services/staff-note.service';
import {Project, User, UserService} from './doubtfire-model';

export class StaffNote extends Entity {
  id: number;

  project: Project;
  user: User;
  note: string;
  replyTo?: StaffNote;
  replyToId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data?: Project) {
    super();
    if (data) {
      this.project = data;
    } else {
      console.error('Failed to get project');
    }
  }

  /**
   * Provide the project id to allow mapping in service.
   */
  public get projectId(): number {
    return this.project.id;
  }

  public get authorIsMe(): boolean {
    const userService: UserService = AppInjector.get(UserService);
    return this.user.id === userService.currentUser.id;
  }

  public delete() {
    const staffNoteService: StaffNoteService = AppInjector.get(StaffNoteService);
    staffNoteService
      .delete({projectId: this.project.id, id: this.id}, {cache: this.project.staffNoteCache})
      .subscribe({
        next: () => {
          AppInjector.get(AlertService).error('Successfully deleted staff note', 4000);
          this.project.staffNoteCount--;
          staffNoteService.updateStaffNoteReplies(this.project.staffNoteCache.currentValues);
        },
        error: (error: Error) => {
          const message = error.message || 'Unknown error';
          AppInjector.get(AlertService).error(message, 2000);
        },
      });
  }
}
