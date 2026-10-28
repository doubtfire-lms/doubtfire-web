import {createConsumer} from '@rails/actioncable';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {Task} from 'src/app/api/models/task';
import {UserService} from 'src/app/api/services/user.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {TaskCableEvent, TaskCableService} from './task-cable.service';

vi.mock('@rails/actioncable', () => ({createConsumer: vi.fn()}));

interface Mixin {
  connected: (arg: {reconnected: boolean}) => void;
  received: (data: {event: TaskCableEvent}) => void;
}

describe('TaskCableService', () => {
  const task = {project: {id: 1}, definition: {id: 2}} as Task;
  let service: TaskCableService;
  let mixins: Mixin[];
  let create: ReturnType<typeof vi.fn>;
  let unsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mixins = [];
    unsubscribe = vi.fn();
    create = vi.fn((_params: object, mixin: Mixin) => {
      mixins.push(mixin);
      return {unsubscribe};
    });
    vi.mocked(createConsumer).mockReset();
    vi.mocked(createConsumer).mockReturnValue({
      subscriptions: {create},
      disconnect: vi.fn(),
    } as never);

    TestBed.configureTestingModule({
      providers: [
        {provide: DoubtfireConstants, useValue: {HOST_URL: 'http://localhost'}},
        {
          provide: UserService,
          useValue: {currentUser: {username: 'student', authenticationToken: 'token'}},
        },
      ],
    });
    service = TestBed.inject(TaskCableService);
  });

  it('shares one subscription per task until the last observer unsubscribes', () => {
    const first = service.eventsFor(task).subscribe();
    const second = service.eventsFor(task).subscribe();

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      {channel: 'TaskChannel', project_id: 1, task_definition_id: 2},
      expect.any(Object),
    );

    first.unsubscribe();
    expect(unsubscribe).not.toHaveBeenCalled();
    second.unsubscribe();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('emits received events and reconnections', () => {
    const events: TaskCableEvent[] = [];
    service.eventsFor(task).subscribe((event) => events.push(event));

    mixins[0].connected({reconnected: false});
    mixins[0].received({event: 'comment_created'});
    mixins[0].connected({reconnected: true});

    expect(events).toEqual(['comment_created', 'reconnected']);
  });

  it('connects with the current user token', () => {
    service.eventsFor(task).subscribe();

    const url = vi.mocked(createConsumer).mock.calls[0][0] as () => string;
    expect(url()).toBe('http://localhost/cable?username=student&auth_token=token');
  });

  it('ignores tasks without a project', () => {
    service.eventsFor({definition: {id: 2}} as Task).subscribe();

    expect(create).not.toHaveBeenCalled();
  });
});
