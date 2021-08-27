import { Component, Input, Inject, Output, EventEmitter } from '@angular/core';
import { currentUser } from 'src/app/ajs-upgraded-providers';
import { CheckIn, CheckInService, Project, Tutorial, User } from 'src/app/api/models/doubtfire-model';
import { OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'user-selector',
  templateUrl: './student_selector.component.html',
  styleUrls: ['./student_selector.component.scss'],
})
export class UserSelectorComponent implements OnInit {
  @Input() userList: Project[];
  @Input() disableAfterSelection: boolean = false;
  @Output() userSelected = new EventEmitter<Project>();
  control = new FormControl();
  filteredUsers: Observable<Project[]>;

  ngOnInit() {
    this.filteredUsers = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: any): Project[] {
    const filterValue = this._normalizeValue(value);
    return this.userList.filter((street) => this._normalizeValue(street).includes(filterValue));
  }

  private _normalizeValue(value: any): string {
    if (!value) return value;

    return typeof value === 'string'
      ? value.toLowerCase().replace(/\s/g, '')
      : value.name.toLowerCase().replace(/\s/g, '');
  }

  public optionSelected(user: Project) {
    this.userSelected.emit(user);
    if (this.disableAfterSelection) {
      this.control.disable();
    }
  }

  public displayName(value: any): string {
    if (value === null) return '';
    return value.name;
  }
}
