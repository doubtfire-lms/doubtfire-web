import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { alertService, analyticsService, taskComment, taskCommentService, taskService } from 'src/app/ajs-upgraded-providers';

import { CommentBubbleActionComponent } from './comment-bubble-action.component';

describe('CommentBubbleActionComponent', () => {
  let injector: TestBed;
  let component: CommentBubbleActionComponent;
  let fixture: ComponentFixture<CommentBubbleActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{provide: CommentBubbleActionComponent, useValue: CommentBubbleActionComponent},
                  {provide: taskComment, useValue: taskComment},{provide: taskService, useValue: taskService},
                  {provide: analyticsService, useValue: analyticsService},{provide: alertService, useValue: alertService} 
                ],
      declarations: [ CommentBubbleActionComponent ]
    })
    
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentBubbleActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
