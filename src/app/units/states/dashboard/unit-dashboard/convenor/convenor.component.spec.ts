import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';
import {ProjectService, TaskService, Unit, UnitRole} from 'src/app/api/models/doubtfire-model';
import {GlobalStateService} from 'src/app/projects/states/index/global-state.service';
import {ConvenorComponent} from './convenor.component';

describe('ConvenorComponent', () => {
  let fixture: ComponentFixture<ConvenorComponent>;
  let staffRole: UnitRole;
  const queryOverflow = vi.fn(() => of([]));

  beforeEach(async () => {
    queryOverflow.mockClear();
    const unit = Object.assign(new Unit(), {id: 1});
    staffRole = Object.assign(new UnitRole(), {
      id: 1,
      unit,
      role: 'Convenor',
      canMarkOverflowTasks: false,
    });
    vi.spyOn(unit, 'staff', 'get').mockReturnValue([staffRole]);

    await TestBed.configureTestingModule({
      imports: [ConvenorComponent],
      providers: [
        {provide: ActivatedRoute, useValue: {parent: {data: of({unit})}}},
        {
          provide: GlobalStateService,
          useValue: {currentViewAndEntitySubject$: {value: {entity: staffRole}}},
        },
        {provide: ProjectService, useValue: {loadStudents: () => of([])}},
        {
          provide: TaskService,
          useValue: {
            queryTasksForTaskInbox: () =>
              of([
                {id: 1, status: 'ready_for_feedback'},
                {id: 1, status: 'ready_for_feedback'},
                {id: 2, status: 'need_help'},
              ]),
            queryTasksForMentorModeration: () => of([{id: 3}, {id: 4}]),
            queryTasksForOverflow: queryOverflow,
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ConvenorComponent);
  });

  it('shows distinct tasks awaiting feedback and the moderation count without inbox links', () => {
    fixture.detectChanges();

    const dashboard: HTMLElement = fixture.nativeElement;
    expect(dashboard.textContent).toMatch(/Ready for feedback\s*1/);
    expect(dashboard.textContent).toMatch(/Moderation queue\s*2/);
    expect(dashboard.textContent).toMatch(/Overflow queue\s*Unavailable/);
    expect(dashboard.querySelector('a')).toBeNull();
    expect(queryOverflow).not.toHaveBeenCalled();
  });

  it('shows zero when a convenor can access an empty overflow queue', () => {
    staffRole.canMarkOverflowTasks = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toMatch(/Overflow queue\s*0/);
    expect(queryOverflow).toHaveBeenCalledOnce();
  });
});
