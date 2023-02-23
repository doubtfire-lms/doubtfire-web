// import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { TaskComment } from 'src/app/api/models/doubtfire-model';

// import { CommentBubbleActionComponent } from './comment-bubble-action.component';

// describe('CommentBubbleActionComponent', () => {
//   let component: CommentBubbleActionComponent;
//   let fixture: ComponentFixture<CommentBubbleActionComponent>;
//   let taskComment: TaskComment;

//   beforeEach(
//     waitForAsync(() => {
//       TestBed.configureTestingModule({
//         declarations: [CommentBubbleActionComponent],
//       }).compileComponents();
//     })
//   );

//   beforeEach(() => {
//     fixture = TestBed.createComponent(CommentBubbleActionComponent);
//     component = fixture.componentInstance;

//     taskComment = jasmine.createSpyObj('TaskComment', ['currentUserCanEdit']);
//     taskComment.currentUserCanEdit.and.returnValue(false);
//     component.comment = taskComment;

//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
