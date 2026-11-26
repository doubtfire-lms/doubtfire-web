import {Component, input, output} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {UnitRole} from 'src/app/api/models/unit-role';

export const VIEW_AS_SELF = 'self';
export type StaffViewAsId = number | typeof VIEW_AS_SELF;

@Component({
  selector: 'f-staff-view-as-selector',
  imports: [MatFormFieldModule, MatSelectModule],
  // eslint-disable-next-line @angular-eslint/component-max-inline-declarations
  template: `
    <mat-form-field appearance="outline" class="w-full" subscriptSizing="dynamic">
      <mat-label>{{ label() }}</mat-label>
      <mat-select [value]="value()" (selectionChange)="valueChange.emit($event.value)">
        <mat-option [value]="self">Myself</mat-option>
        @for (role of staff(); track role.id) {
          <mat-option [value]="role.id">
            <span class="truncate">{{ role.user?.name }}</span>
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class StaffViewAsSelectorComponent {
  readonly label = input.required<string>();
  readonly staff = input.required<UnitRole[]>();
  readonly value = input.required<StaffViewAsId>();
  readonly valueChange = output<StaffViewAsId>();

  protected readonly self = VIEW_AS_SELF;
}
