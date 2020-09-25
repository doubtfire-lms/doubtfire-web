import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommentBubbleActionComponent } from './comment-bubble-action.component';

describe('CommentBubbleActionComponent', () => {
  let component: CommentBubbleActionComponent;
  let fixture: ComponentFixture<CommentBubbleActionComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CommentBubbleActionComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentBubbleActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
