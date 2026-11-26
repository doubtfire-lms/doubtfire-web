import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {GroupSet, Unit} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'group-set-selector',
  templateUrl: './group-set-selector.component.html',
  styleUrls: ['./group-set-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GroupSetSelectorComponent implements OnInit {
  @Input() unit: Unit;
  @Input() selectedGroupSet: GroupSet;
  @Output() selectedGroupSetChange: EventEmitter<GroupSet> = new EventEmitter();

  ngOnInit(): void {
    if (!this.unit) {
      throw new Error('Unit not supplied to group set selector');
    }
  }

  /**
   * Emits the selected group set and updates the parent component.
   *
   * Also updates the local state.
   *
   * @param {GroupSet} groupSet
   */
  selectGroupSet(groupSet: GroupSet): void {
    this.selectedGroupSet = groupSet;
    this.selectedGroupSetChange.emit(this.selectedGroupSet);
  }
}
