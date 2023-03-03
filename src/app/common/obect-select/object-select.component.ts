import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';

/**
 * Object select component used to overcome limitations with the angularjs version used.
 *
 * @deprecated
 */
@Component({
  selector: 'object-select',
  templateUrl: 'object-select.component.html',
  // styleUrls: ['object-select.component.scss'],
})
export class ObjectSelectComponent<T> implements OnInit {
  @Input() source: {value: T; text: string}[];
  @Input() target: T;
  @Input() label: string;
  @Output() targetChange = new EventEmitter<T>();

  constructor() { }

  selectionChange($event: MatSelectChange) {
    this.target = $event.value;
    this.targetChange.emit($event.value);
  }

  public compareFn(a: T, b: T): boolean {
    return (!a && !b) || a === b;
  }

  ngOnChanges() {
    // this.originalCampus = this.student.campus;
  }

  ngOnInit() {
    // this.campusService.query().subscribe((campuses) => {
    //   this.campuses = campuses;
    // });
  }
}
