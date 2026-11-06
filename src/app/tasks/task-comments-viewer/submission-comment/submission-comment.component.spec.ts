import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SubmissionCommentComponent} from './submission-comment.component';
import {AlertService} from 'src/app/common/services/alert.service';

describe('SubmissionCommentComponent', () => {
  let component: SubmissionCommentComponent;
  let fixture: ComponentFixture<SubmissionCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubmissionCommentComponent],
      providers: [{provide: AlertService, useValue: {}}],
    })
      .overrideComponent(SubmissionCommentComponent, {set: {template: ''}})
      .compileComponents();

    fixture = TestBed.createComponent(SubmissionCommentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
