/* eslint-disable @typescript-eslint/no-explicit-any */
import {Component, OnInit} from '@angular/core';
import {StateService, UIRouterGlobals} from '@uirouter/angular';

@Component({
  selector: 'f-units-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  unitRole: any;
  unit: any;
  unitId!: number;
  project: any;

  constructor(
    private state: StateService,
    private globals: UIRouterGlobals,
  ) {}

  ngOnInit(): void {
    this.unitId = +this.globals.params['unitId'];

    if (!this.unitId) {
      this.state.go('home');
      return;
    }


  }
}
