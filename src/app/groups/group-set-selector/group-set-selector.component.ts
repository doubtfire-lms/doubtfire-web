import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/autocomplete';
import {MatFormField} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {GroupSet, Unit} from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'group-set-selector',
  templateUrl: './group-set-selector.component.html',
  styleUrls: ['./group-set-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatFormField, MatSelect, FormsModule, MatOption],
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
