import {Entity} from 'ngx-entity-service';
import {Project, Unit, User} from './doubtfire-model';
import {AppInjector} from 'src/app/app-injector';
import {AlertService} from 'src/app/common/services/alert.service';
import {StaffNoteService} from '../services/staff-note.service';

export class StaffNote extends Entity {
  id: number;

  project: Project;
  author: User;
  replyTo: StaffNote;
  createdAt: Date;
  updatedAt: Date;

  constructor(data?: Project) {
    super();
    if (data instanceof Project) {
      this.project = data as Project;
    }
  }

  /**
   * Provide the project id to allow mapping in service.
   */
  public get projectId(): number {
    return this.project.id;
  }

  // public delete() {
  //   const staffNoteService: StaffNoteService = AppInjector.get(StaffNoteService);
  //   staffNoteService
  //     .delete({projectId: this.project.id, id: this.id}, {cache: this.project.staffNoteCache})
  //     .subscribe({
  //       next: (response: object) => {
  //         console.log('deleted staff note');
  //       },
  //       error: (error: any) => {
  //         AppInjector.get(AlertService).error(error?.message || error || 'Unknown error', 2000);
  //       },
  //     });
  // }
}
