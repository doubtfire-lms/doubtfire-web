import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'task-dropdown',
  templateUrl: './task-dropdown.component.html',
  styleUrls: ['./task-dropdown.component.scss'],
})
export class TaskDropdownComponent implements OnInit {
  @Input() task: any;
  @Input() data: { isTutor: boolean };
  @Input() unit: any;
  @Input() project: any;
  @Input() unitRole: any;
  taskDropdownData: { title: string; target: string; visible: any }[];
  constructor() {}

  //   <button mat-menu-item>Task Inbox</button>
  //     <button mat-menu-item>Mark By Definition</button>
  //     <button mat-menu-item>Mark Tasks Offline</button>
  //     <button mat-menu-item>Task List</button>
  //     <mat-divider></mat-divider>
  //     <button mat-menu-item>Student List</button>
  //     <button mat-menu-item>Student Groups</button>
  //     <button mat-menu-item>Student Plagiarism</button>
  //     <button mat-menu-item>Student Portfolios</button>
  //     <span>
  //       <mat-divider></mat-divider>
  //       <button mat-menu-item>Unit Analytics</button>
  //       <button *ngIf="unit?.role === 'Convenor' || unit?.role === 'Admin'" mat-menu-item>Unit Administration</button>
  //     </span>
  //   </mat-menu>
  // </span>

  // <span *ngIf="task">
  //   <button mat-button [matMenuTriggerFor]="menu2">{{ task }}</button>
  //   <mat-menu #menu2="matMenu">
  //     <button mat-menu-item *ngIf="project != null">Dashboard</button>
  //     <mat-divider *ngIf="project != null"></mat-divider>
  //     <button mat-menu-item *ngIf="project != null">Learning Outcomes</button>
  //     <button mat-menu-item *ngIf="project != null">Portfolio Creation</button>
  //     <mat-divider *ngIf="project != null"></mat-divider>
  //     <button mat-menu-item *ngIf="project != null">Groups List</button>
  //     <button mat-menu-item *ngIf="project != null">Tutorial List</button>
  //     <button mat-menu-item *ngIf="unitRole != null && unitRole?.role !== 'Admin'">Task Inbox</button>
  //     <button mat-menu-item *ngIf="unitRole != null && unitRole?.role !== 'Admin'">Mark By Definition</button>
  //     <button mat-menu-item *ngIf="unitRole != null && unitRole?.role !== 'Admin'">Mark Tasks Offline</button>
  //     <mat-divider *ngIf="unitRole != null && unitRole?.role !== 'Admin'"></mat-divider>
  //     <button mat-menu-item *ngIf="unitRole != null && unitRole?.role !== 'Admin'">Student List</button>
  //     <button mat-menu-item *ngIf="unitRole != null && unitRole?.role !== 'Admin'">Student Groups</button>
  //     <button mat-menu-item *ngIf="unitRole != null && unitRole?.role !== 'Admin'">Student Plagiarism</button>
  //     <button mat-menu-item *ngIf="unitRole != null && unitRole?.role !== 'Admin'">Student Portfolios</button>

  //     <mat-divider *ngIf="unitRole != null && unitRole?.role !== 'Admin'"></mat-divider>
  //     <button mat-menu-item *ngIf="unitRole != null && unitRole?.role !== 'Admin'">Unit Analytics</button>
  //     <button
  //       *ngIf="(unitRole != null && unitRole?.role === 'Convenor') || (unitRole != null && unitRole?.role === 'Admin')"
  //       mat-menu-item
  //     >
  //       Unit Administration
  //     </button>
  //   </mat-menu>

  ngOnInit(): void {
    this.taskDropdownData = [
      { title: 'Mark by definition', target: '', visible: this.task != null && this.data.isTutor },
      { title: 'Mark Tasks Offline', target: '', visible: this.task != null && this.data.isTutor != null },
      { title: 'Task List', target: '', visible: this.task != null && this.data.isTutor != null },
      { title: 'Student List', target: '', visible: this.task != null && this.data.isTutor != null },
      { title: 'Mark Tasks Offline', target: '', visible: this.task != null && this.data.isTutor != null },
      { title: 'Student Groups', target: '', visible: this.task != null && this.data.isTutor != null },
      { title: 'Student Plagiarism', target: '', visible: this.task != null && this.data.isTutor != null },
      { title: 'Student Portfolios', target: '', visible: this.task != null && this.data.isTutor != null },
      { title: 'Unit Analytics', target: '', visible: this.task != null && this.data.isTutor != null },
    ];
  }
}
