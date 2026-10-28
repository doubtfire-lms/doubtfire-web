import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';

/**
 * Object select component used to overcome limitations with the angularjs version used.
 *
 * @deprecated
 */
@Component({
  selector: 'object-select',
  templateUrl: 'object-select.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ObjectSelectComponent<T> {
  @Input() source: {value: T; text: string}[];
  @Input() target: T;
  @Input() label: string;
  @Input() placeholder: string = null;
  @Output() targetChange: EventEmitter<T> = new EventEmitter();

  selectionChange($event: MatSelectChange) {
    this.target = $event.value;
    this.targetChange.emit($event.value);
  }

  public compareFn(a: T, b: T): boolean {
    return (!a && !b) || a === b;
  }
}
