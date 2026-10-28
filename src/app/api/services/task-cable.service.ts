import {Consumer, createConsumer} from '@rails/actioncable';
import {Injectable, NgZone} from '@angular/core';
import {EMPTY, Observable, share} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {UserService} from 'src/app/api/services/user.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

// 'reconnected' means events may have been missed while the connection was down
export type TaskCableEvent = 'comment_created' | 'status_changed' | 'reconnected';

@Injectable({providedIn: 'root'})
export class TaskCableService {
  private consumer: Consumer;
  private readonly taskEvents: Map<string, Observable<TaskCableEvent>> = new Map();

  constructor(
    private constants: DoubtfireConstants,
    private userService: UserService,
    private zone: NgZone,
  ) {}

  // One server subscription per task, shared by all observers and closed when the last one unsubscribes
  public eventsFor(task: Task): Observable<TaskCableEvent> {
    const projectId = task?.project?.id;
    const taskDefinitionId = task?.definition?.id;
    if (!projectId || !taskDefinitionId) {
      return EMPTY;
    }

    const key = `${projectId}:${taskDefinitionId}`;
    const existing = this.taskEvents.get(key);
    if (existing) {
      return existing;
    }

    const events$ = new Observable<TaskCableEvent>((subscriber) => {
      const emit = (event: TaskCableEvent) => this.zone.run(() => subscriber.next(event));
      // Outside the zone so Action Cable's pings and reconnect timers skip change detection
      const subscription = this.zone.runOutsideAngular(() =>
        this.getConsumer().subscriptions.create(
          {channel: 'TaskChannel', project_id: projectId, task_definition_id: taskDefinitionId},
          {
            connected: ({reconnected}) => {
              if (reconnected) {
                emit('reconnected');
              }
            },
            received: (data: {event: TaskCableEvent}) => emit(data.event),
          },
        ),
      );

      return () => {
        subscription.unsubscribe();
        if (this.taskEvents.get(key) === events$) {
          this.taskEvents.delete(key);
        }
      };
    }).pipe(share());

    this.taskEvents.set(key, events$);
    return events$;
  }

  public disconnect(): void {
    this.consumer?.disconnect();
    this.consumer = null;
    this.taskEvents.clear();
  }

  private getConsumer(): Consumer {
    // The URL is rebuilt on each reconnect so it picks up a refreshed token
    this.consumer ??= createConsumer(() => this.cableUrl());
    return this.consumer;
  }

  private cableUrl(): string {
    const user = this.userService.currentUser;
    const params = new URLSearchParams({
      username: user?.username ?? '',
      auth_token: user?.authenticationToken ?? '',
    });

    return `${this.constants.HOST_URL}/cable?${params.toString()}`;
  }
}
