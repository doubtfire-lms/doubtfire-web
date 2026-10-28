/* eslint-disable @typescript-eslint/no-explicit-any */
import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {Unit} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'f-unit-root-state',
  templateUrl: './unit-root-state.component.html',
  styleUrl: './unit-root-state.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UnitRootStateComponent implements OnInit {
  @Input() public unit$: Observable<Unit>;
  public unit: Unit;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.unit = data.unit;
    });
  }
}
