import {CachedEntityService, RequestOptions} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Project, ProjectService, UserService} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {StaffNote} from '../models/staff-note';

@Injectable()
export class StaffNoteService extends CachedEntityService<StaffNote> {
  public readonly staffNoteAdded$: EventEmitter<StaffNote> = new EventEmitter();

  protected readonly endpointFormat = 'projects/:projectId:/staff_notes/:id:';

  constructor(
    httpClient: HttpClient,
    private userService: UserService,
    private projectService: ProjectService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys('id', 'note', 'createdAt', 'updatedAt', 'replyToId', {
      keys: ['user', 'user_id'],
      toEntityFn: (data: object, key: string, staffNote: StaffNote) => {
        const userRole = staffNote.project.unit.staff.find((s) => s.user.id === data['user_id']);

        // const user = this.userService.cache.getOrCreate(data[key]?.id, userService, data[key]);
        return userRole.user;
      },
    });

    this.mapping.addJsonKey('note', 'createdAt', 'updatedAt');
  }

  public createInstanceFrom(json: object, other?: Project): StaffNote {
    return new StaffNote(other);
  }

  public addNote(project: Project, text: string, originalNote: StaffNote): Observable<StaffNote> {
    const pathId = {
      projectId: project.id,
    };

    const body: FormData = new FormData();
    if (originalNote) {
      body.append('reply_to_id', originalNote?.id.toString());
    }

    body.append('note', text);

    const opts: RequestOptions<StaffNote> = {endpointFormat: this.endpointFormat};
    opts.cache = project.staffNoteCache;
    opts.body = body;
    opts.constructorParams = project;

    return this.create(pathId, opts).pipe(
      tap((note: StaffNote) => {
        this.staffNoteAdded$.emit(note);
      }),
    );
  }

  public updateStaffNoteReplies(staffNotes: readonly StaffNote[]) {
    for (const note of staffNotes) {
      if (note.replyToId) {
        const repliedTo = staffNotes.find((n) => n.id === note.replyToId);
        if (repliedTo) {
          note.replyTo = repliedTo;
        } else {
          // Remove deleted replies
          note.replyTo = null;
        }
      }
    }
  }

  public updateNote(project: Project, note: StaffNote, text: string): Observable<StaffNote> {
    const pathId = {
      projectId: project.id,
      id: note.id,
    };

    const body: FormData = new FormData();
    body.append('note', text);

    const opts: RequestOptions<StaffNote> = {endpointFormat: this.endpointFormat};
    opts.cache = project.staffNoteCache;
    opts.body = body;
    opts.constructorParams = project;

    return this.put(pathId, opts).pipe(
      tap((_note: StaffNote) => {
        note.note = text;
      }),
    );
  }

  public loadStaffNotes(project: Project, useFetch: boolean = false): Observable<StaffNote[]> {
    const options: RequestOptions<StaffNote> = {
      endpointFormat: this.endpointFormat,
      cache: project.staffNoteCache,
      sourceCache: project.staffNoteCache,
      cacheBehaviourOnGet: 'cacheQuery',
      constructorParams: project,
    };

    if (useFetch) {
      return super.fetchAll(
        {
          projectId: project.id,
        },
        options,
      );
    } else {
      return super.query(
        {
          projectId: project.id,
        },
        options,
      );
    }
  }
}
