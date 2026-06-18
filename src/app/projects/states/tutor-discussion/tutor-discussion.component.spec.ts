import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TutorDiscussionComponent} from './tutor-discussion.component';

describe('TutorDiscussionComponent', () => {
  let component: TutorDiscussionComponent;
  let fixture: ComponentFixture<TutorDiscussionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorDiscussionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TutorDiscussionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
