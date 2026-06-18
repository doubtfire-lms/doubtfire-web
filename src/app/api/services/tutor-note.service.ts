import {CachedEntityService, RequestOptions} from 'ngx-entity-service';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {ProjectService, Task, UnitRole, UserService} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {TutorNote} from '../models/tutor-note';

@Injectable()
export class TutorNoteService extends CachedEntityService<TutorNote> {
  protected readonly endpointFormat = 'unit_roles/:unitRoleId:/tutor_notes/:id:';
  protected readonly markAsReadEndpointFormat =
    'unit_roles/:unitRoleId:/tutor_notes/:id:/mark_as_read';

  constructor(
    httpClient: HttpClient,
    private userService: UserService,
    private projectService: ProjectService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys(
      'id',
      'note',
      'createdAt',
      'updatedAt',
      'replyToId',
      {
        keys: ['user', 'user_id'],
        toEntityFn: (data: object, _key: string, tutorNote: TutorNote) => {
          const userRole = tutorNote.unitRole.unit.staff.find((s) => s.user.id === data['user_id']);
          // If the user is not a staff in the unit it will be null
          return userRole?.user;
        },
      },
      {
        keys: ['taskDefinition', 'task_definition_id'],
        toEntityFn: (data: object, _key: string, tutorNote: TutorNote) => {
          const taskDefinition = tutorNote.unitRole.unit.taskDefinitions.find(
            (td) => td.id === data['task_definition_id'],
          );
          return taskDefinition;
        },
      },
      {
        keys: ['project', 'project_id'],
        toEntityFn: (data: object, key: string, tutorNote: TutorNote) => {
          const project = tutorNote.unitRole.unit.students.find((p) => p.id === data['project_id']);
          return project;
        },
      },
      'readByUnitRole',
    );

    this.mapping.addJsonKey('note', 'createdAt', 'updatedAt');
  }

  public createInstanceFrom(_json: object, other?: UnitRole): TutorNote {
    return new TutorNote(other);
  }

  public addNote(
    unitRole: UnitRole,
    text: string,
    task?: Task,
    originalNote?: TutorNote,
  ): Observable<TutorNote> {
    const pathId = {
      unitRoleId: unitRole.id,
    };

    const body: FormData = new FormData();
    if (originalNote) {
      body.append('reply_to_id', originalNote?.id.toString());
    }

    if (task) {
      body.append('task_id', task?.id.toString());
    }

    body.append('note', text);

    const opts: RequestOptions<TutorNote> = {endpointFormat: this.endpointFormat};
    opts.cache = unitRole.tutorNotesCache;
    opts.body = body;
    opts.constructorParams = unitRole;

    return this.create(pathId, opts);
  }

  public updateTutorNoteReplies(tutorNotes: readonly TutorNote[]) {
    for (const note of tutorNotes) {
      if (note.replyToId) {
        const repliedTo = tutorNotes.find((n) => n.id === note.replyToId);
        if (repliedTo) {
          note.replyTo = repliedTo;
        } else {
          // Remove deleted replies
          note.replyTo = null;
        }
      }
    }
  }

  public updateNote(unitRole: UnitRole, note: TutorNote, text: string): Observable<TutorNote> {
    const pathId = {
      unitRoleId: unitRole.id,
      id: note.id,
    };

    const body: FormData = new FormData();
    body.append('note', text);

    const opts: RequestOptions<TutorNote> = {endpointFormat: this.endpointFormat};
    opts.cache = unitRole.tutorNotesCache;
    opts.body = body;
    opts.constructorParams = unitRole;

    return this.put(pathId, opts).pipe(
      tap((_note: TutorNote) => {
        note.note = text;
      }),
    );
  }

  public markAsRead(unitRole: UnitRole, note: TutorNote): Observable<boolean> {
    const pathId = {
      unitRoleId: unitRole.id,
      id: note.id,
    };

    const opts: RequestOptions<TutorNote> = {endpointFormat: this.markAsReadEndpointFormat};
    opts.cache = unitRole.tutorNotesCache;
    opts.constructorParams = unitRole;

    return this.put<boolean>(pathId, opts).pipe(
      tap((response: boolean) => {
        if (response) {
          note.readByUnitRole = true;
          if (unitRole.user.id !== note.user.id) {
            unitRole.tutorNoteCount--;
          }
          // unitRole.tutorNoteCount = unitRole.tutorNotesCache.currentValues.filter(
          //   (note) => !note.readByUnitRole,
          // ).length;
        }
      }),
    );
  }

  public loadTutorNotes(unitRole: UnitRole, useFetch: boolean = false): Observable<TutorNote[]> {
    const options: RequestOptions<TutorNote> = {
      endpointFormat: this.endpointFormat,
      cache: unitRole.tutorNotesCache,
      sourceCache: unitRole.tutorNotesCache,
      cacheBehaviourOnGet: 'cacheQuery',
      constructorParams: unitRole,
    };

    if (useFetch) {
      return super.fetchAll(
        {
          unitRoleId: unitRole.id,
        },
        options,
      );
    } else {
      return super.query(
        {
          unitRoleId: unitRole.id,
        },
        options,
      );
    }
  }
}
