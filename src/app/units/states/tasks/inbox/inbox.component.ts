import { Component, Input, OnInit } from '@angular/core';
import { StateService, UIRouter } from '@uirouter/core';
import { Unit } from 'src/app/api/models/unit';
import { UnitRole } from 'src/app/api/models/unit-role';

@Component({
  selector: 'f-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxComponent implements OnInit {
  @Input() unit: Unit;
  @Input() unitRole: UnitRole;
  @Input() taskData: any;
  constructor(private router: UIRouter, private state: StateService) {}

  ngOnInit(): void {}
}
