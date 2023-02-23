// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatMenuModule } from '@angular/material/menu';
// import { alertService, currentUser, groupService, taskDefinition, Unit } from 'src/app/ajs-upgraded-providers';

// import { StaffTaskListComponent } from './staff-task-list.component';

// describe('StaffTaskListComponent', () => {
//   let component: StaffTaskListComponent;
//   let fixture: ComponentFixture<StaffTaskListComponent>;
//   let taskDefinitionStub: jasmine.SpyObj<any>;
//   let unitStub: jasmine.SpyObj<any>;
//   let currentUserStub: jasmine.SpyObj<any>;
//   let groupServiceStub: jasmine.SpyObj<any>;
//   let alertServiceStub: jasmine.SpyObj<any>;

//   beforeEach(
//     waitForAsync(() => {
//       unitStub = {
//         tasksForDefinition: [],
//       };
//       currentUserStub = {
//         profile: { name: 'Bob Marley' },
//       };

//       TestBed.configureTestingModule({
//         declarations: [StaffTaskListComponent],
//         imports: [
//           MatDialogModule,
//           MatMenuModule
//         ],
//         providers: [
//           { provide: taskDefinition, useValue: taskDefinitionStub },
//           { provide: currentUser, useValue: currentUserStub },
//           { provide: groupService, useValue: groupServiceStub },
//           { provide: alertService, useValue: alertServiceStub },
//         ],
//       }).compileComponents();
//     })
//   );

//   beforeEach(() => {
//     fixture = TestBed.createComponent(StaffTaskListComponent);
//     component = fixture.componentInstance;

//     component.taskData = {
//       selectedTask: null,
//     };
//     component.unit = {
//       tutorialsForUserName: () => [],
//       tutorials: [],
//     };
//     component.unitRole = {
//       role: 'Convenor',
//     };

//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
