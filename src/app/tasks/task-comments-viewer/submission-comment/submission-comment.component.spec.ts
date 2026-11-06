import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SubmissionCommentComponent} from './submission-comment.component';

describe('SubmissionCommentComponent', () => {
  let component: SubmissionCommentComponent;
  let fixture: ComponentFixture<SubmissionCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionCommentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmissionCommentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
