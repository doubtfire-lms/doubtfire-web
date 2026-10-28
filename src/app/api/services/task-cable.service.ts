import {Consumer, createConsumer} from '@rails/actioncable';
import {Inject, Injectable, InjectionToken, NgZone} from '@angular/core';
import {EMPTY, Observable, share} from 'rxjs';
import {Project} from 'src/app/api/models/project';
import {Task} from 'src/app/api/models/task';
import {UserService} from 'src/app/api/services/user.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

// 'reconnected' means events may have been missed while the connection was down
export type TaskCableEvent =
  'comment_created' | 'status_changed' | 'submission_processed' | 'reconnected';

export interface ProjectCableEvent {
  event: TaskCableEvent;
  taskDefinitionId: number;
}

interface CableMessage {
  event: TaskCableEvent;
  task_definition_id?: number;
}

type ChannelIdentifier = {channel: string} & Record<string, string | number>;

// Injected so specs can swap it; vi.mock misses packages the Angular test builder bundles
export const CABLE_CONSUMER_FACTORY: InjectionToken<typeof createConsumer> = new InjectionToken(
  'CABLE_CONSUMER_FACTORY',
  {providedIn: 'root', factory: () => createConsumer},
);

@Injectable({providedIn: 'root'})
export class TaskCableService {
  private consumer: Consumer;
  private readonly channels: Map<string, Observable<unknown>> = new Map();

  constructor(
    private constants: DoubtfireConstants,
    private userService: UserService,
    private zone: NgZone,
    @Inject(CABLE_CONSUMER_FACTORY) private consumerFactory: typeof createConsumer,
  ) {}

  public eventsFor(task: Task): Observable<TaskCableEvent> {
    const projectId = task?.project?.id;
    const taskDefinitionId = task?.definition?.id;
    if (!projectId || !taskDefinitionId) {
      return EMPTY;
    }

    return this.channelEvents(
      {channel: 'TaskChannel', project_id: projectId, task_definition_id: taskDefinitionId},
      (data) => data.event,
      'reconnected',
    );
  }

  // No reconnect resync: refetching every task after a deploy would flood the API
  public projectEventsFor(project: Project): Observable<ProjectCableEvent> {
    if (!project?.id) {
      return EMPTY;
    }

    return this.channelEvents({channel: 'ProjectChannel', project_id: project.id}, (data) => ({
      event: data.event,
      taskDefinitionId: data.task_definition_id,
    }));
  }

  public disconnect(): void {
    this.consumer?.disconnect();
    this.consumer = null;
    this.channels.clear();
  }

  // One server subscription per channel, shared by all observers and closed when the last one unsubscribes
  private channelEvents<T>(
    identifier: ChannelIdentifier,
    toEvent: (data: CableMessage) => T,
    onReconnect?: T,
  ): Observable<T> {
    const key = JSON.stringify(identifier);
    const existing = this.channels.get(key) as Observable<T>;
    if (existing) {
      return existing;
    }

    const events$ = new Observable<T>((subscriber) => {
      const emit = (event: T) => this.zone.run(() => subscriber.next(event));
      // Outside the zone so Action Cable's pings and reconnect timers skip change detection
      const subscription = this.zone.runOutsideAngular(() =>
        this.getConsumer().subscriptions.create(identifier, {
          connected: ({reconnected}) => {
            if (reconnected && onReconnect !== undefined) {
              emit(onReconnect);
            }
          },
          received: (data: CableMessage) => emit(toEvent(data)),
        }),
      );

      return () => {
        subscription.unsubscribe();
        if (this.channels.get(key) === events$) {
          this.channels.delete(key);
        }
      };
    }).pipe(share());

    this.channels.set(key, events$);
    return events$;
  }

  private getConsumer(): Consumer {
    // The URL is rebuilt on each reconnect so it picks up a refreshed token
    this.consumer ??= this.consumerFactory(() => this.cableUrl());
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
