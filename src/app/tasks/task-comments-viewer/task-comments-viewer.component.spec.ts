// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { EventEmitter } from '@angular/core';
// import { alertService, commentsModal } from 'src/app/ajs-upgraded-providers';
// import { TaskComment, TaskCommentService } from 'src/app/api/models/doubtfire-model';
// import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

// import { TaskCommentsViewerComponent } from './task-comments-viewer.component';

// describe('TaskCommentsViewerComponent', () => {
//   let component: TaskCommentsViewerComponent;
//   let fixture: ComponentFixture<TaskCommentsViewerComponent>;
//   let taskCommentServiceStub: Partial<TaskCommentService>;
//   let doubtfireConstantsStub: Partial<DoubtfireConstants>;
//   let commentsModalStub: jasmine.SpyObj<any>;
//   let taskStub: jasmine.SpyObj<any>;
//   let alertServiceStub: jasmine.SpyObj<any>;

//   beforeEach(
//     waitForAsync(() => {
//       const commentAdded: EventEmitter<TaskComment> = new EventEmitter();
//       taskCommentServiceStub = {
//         commentAdded$: commentAdded,
//       };

//       TestBed.configureTestingModule({
//         declarations: [TaskCommentsViewerComponent],
//         providers: [
//           { provide: TaskCommentService, useValue: taskCommentServiceStub },
//           { provide: DoubtfireConstants, useValue: doubtfireConstantsStub },
//           { provide: commentsModal, useValue: commentsModalStub },
//           { provide: Task, useValue: taskStub },
//           { provide: alertService, useValue: alertServiceStub },
//         ],
//       }).compileComponents();
//     })
//   );

//   beforeEach(() => {
//     fixture = TestBed.createComponent(TaskCommentsViewerComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
