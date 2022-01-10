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
  constructor() {}

  ngOnInit(): void {}
}
