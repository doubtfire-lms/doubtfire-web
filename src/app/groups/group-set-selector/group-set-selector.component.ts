import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GroupSet, Unit } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'group-set-selector',
  templateUrl: './group-set-selector.component.html',
  styleUrls: ['./group-set-selector.component.scss'],
})
export class GroupSetSelectorComponent {
  @Input() unit: Unit;
  @Input() selectedGroupSet: GroupSet;
  @Output() onSelectGroupSet = new EventEmitter<GroupSet>();

  constructor() {
    if (!this.unit) throw new Error('Unit not supplied to group set selector');
  }

  selectGroupSet() {
    this.onSelectGroupSet.emit(this.selectedGroupSet);
  }
}
