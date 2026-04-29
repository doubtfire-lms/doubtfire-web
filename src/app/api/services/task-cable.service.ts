import {Injectable, NgZone} from '@angular/core';
import {Subject} from 'rxjs';
import {Task} from 'src/app/api/models/task';
import {UserService} from 'src/app/api/services/user.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

export type TaskCableEventType = 'comment_created' | 'status_changed';

export interface TaskCableEvent {
  event: TaskCableEventType;
  projectId: number;
  taskDefinitionId: number;
}

@Injectable({providedIn: 'root'})
export class TaskCableService {
  public readonly events$ = new Subject<TaskCableEvent>();

  private socket: WebSocket;
  private identifier: string;
  private subscribedTaskKey: string;

  constructor(
    private constants: DoubtfireConstants,
    private userService: UserService,
    private zone: NgZone,
  ) {}

  public subscribeToTask(task: Task): void {
    if (!task?.project?.id || !task?.definition?.id) {
      this.unsubscribe();
      return;
    }

    const taskKey = `${task.project.id}:${task.definition.id}`;
    if (this.subscribedTaskKey === taskKey && this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.unsubscribe();
    this.subscribedTaskKey = taskKey;
    this.identifier = JSON.stringify({
      channel: 'TaskChannel',
      project_id: task.project.id,
      task_definition_id: task.definition.id,
    });

    const currentUser = this.userService.currentUser;
    if (!currentUser?.username || !currentUser?.authenticationToken) {
      return;
    }

    const socket = new WebSocket(
      this.cableUrl(currentUser.username, currentUser.authenticationToken),
    );
    this.socket = socket;
    socket.onopen = () => this.send({command: 'subscribe', identifier: this.identifier});
    socket.onmessage = (message) => this.receiveMessage(message, task, taskKey);
    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
      }
    };
  }

  public unsubscribe(): void {
    if (this.socket && this.identifier && this.socket.readyState === WebSocket.OPEN) {
      this.send({command: 'unsubscribe', identifier: this.identifier});
    }
    this.socket?.close();
    this.socket = null;
    this.identifier = null;
    this.subscribedTaskKey = null;
  }

  private receiveMessage(message: MessageEvent, task: Task, taskKey: string): void {
    if (this.subscribedTaskKey !== taskKey) {
      return;
    }

    const data = JSON.parse(message.data);
    if (data.type || !data.message?.event) {
      return;
    }

    this.zone.run(() => {
      this.events$.next({
        event: data.message.event,
        projectId: task.project.id,
        taskDefinitionId: task.definition.id,
      });
    });
  }

  private send(data: object): void {
    this.socket?.send(JSON.stringify(data));
  }

  private cableUrl(username: string, authToken: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = this.constants.HOST_URL.replace(/^https?/, protocol);
    const params = new URLSearchParams({
      username,
      authToken,
    });

    return `${host}/cable?${params.toString()}`;
  }
}
