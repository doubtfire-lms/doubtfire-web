import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CachedEntityService, RequestOptions} from 'ngx-entity-service';
import {Observable, tap} from 'rxjs';
import {ProjectService, UnitRole, UserService} from 'src/app/api/models/doubtfire-model';
import API_URL from 'src/app/config/constants/apiUrl';
import {TutorNote} from '../models/tutor-note';

@Injectable()
export class TutorNoteService extends CachedEntityService<TutorNote> {
  // public readonly staffNoteAdded$: EventEmitter<StaffNote> = new EventEmitter();

  protected readonly endpointFormat = 'unit_roles/:unitRoleId:/tutor_notes/:id:';

  constructor(
    httpClient: HttpClient,
    private userService: UserService,
    private projectService: ProjectService,
  ) {
    super(httpClient, API_URL);

    this.mapping.addKeys('id', 'note', 'createdAt', 'updatedAt', 'replyToId', {
      keys: ['user', 'user_id'],
      toEntityFn: (data: object, key: string, tutorNote: TutorNote) => {
        const userRole = tutorNote.unitRole.unit.staff.find((s) => s.user.id === data['user_id']);
        // const user = this.userService.cache.getOrCreate(data[key]?.id, userService, data[key]);
        // If the user is not a staff in the unit it will be null
        return userRole?.user;
      },
    });

    this.mapping.addJsonKey('note', 'createdAt', 'updatedAt');
  }

  public createInstanceFrom(json: object, other?: UnitRole): TutorNote {
    return new TutorNote(other);
  }

  public addNote(unitRole: UnitRole, text: string, originalNote: TutorNote): Observable<TutorNote> {
    const pathId = {
      unitRoleId: unitRole.id,
    };

    const body: FormData = new FormData();
    if (originalNote) {
      body.append('reply_to_id', originalNote?.id.toString());
    }

    body.append('note', text);

    const opts: RequestOptions<TutorNote> = {endpointFormat: this.endpointFormat};
    opts.cache = unitRole.tutorNotesCache;
    opts.body = body;
    opts.constructorParams = unitRole;

    return this.create(pathId, opts).pipe(
      tap((note: TutorNote) => {
        // this.staffNoteAdded$.emit(note);
      }),
    );
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
