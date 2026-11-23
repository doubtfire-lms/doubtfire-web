import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';
import {of} from 'rxjs';
import {ProjectService, TaskService, Unit} from 'src/app/api/models/doubtfire-model';
import {ConvenorComponent} from './convenor.component';

describe('ConvenorComponent', () => {
  let fixture: ComponentFixture<ConvenorComponent>;
  const getOverflowAvailableToClaimCount = vi.fn(() => of(3));

  beforeEach(async () => {
    getOverflowAvailableToClaimCount.mockClear();
    const unit = Object.assign(new Unit(), {id: 1});
    vi.spyOn(unit, 'getUserMarkingSessions').mockReturnValue(of([]));
    vi.spyOn(unit, 'getTaskTurnaround').mockReturnValue(of({unit_id: 1, task_definitions: []}));

    await TestBed.configureTestingModule({
      imports: [ConvenorComponent],
      providers: [
        {provide: ActivatedRoute, useValue: {parent: {data: of({unit})}}},
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
            getOverflowAvailableToClaimCount,
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
    expect(dashboard.textContent).toMatch(/Overflow tasks available to claim\s*3/);
    expect(dashboard.querySelector('a')).toBeNull();
    expect(dashboard.querySelector('f-ta-workload-overview')).not.toBeNull();
    expect(dashboard.querySelector('f-task-turnaround')).not.toBeNull();
  });

  it('shows zero when no overflow tasks are available to claim', () => {
    getOverflowAvailableToClaimCount.mockReturnValueOnce(of(0));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toMatch(/Overflow tasks available to claim\s*0/);
  });
});
