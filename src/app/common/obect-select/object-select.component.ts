import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

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
export class ObjectSelectComponent<T> {
  @Input() source: { value: T; text: string }[];
  @Input() target: T;
  @Input() label: string;
  @Input() placeholder: string = null;
  @Output() targetChange = new EventEmitter<T>();

  selectionChange($event: MatSelectChange) {
    this.target = $event.value;
    this.targetChange.emit($event.value);
  }

  public compareFn(a: T, b: T): boolean {
    return (!a && !b) || a === b;
  }
}
