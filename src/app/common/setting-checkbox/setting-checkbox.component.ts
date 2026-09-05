import {ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';
import {MatCheckboxChange} from '@angular/material/checkbox';

/**
 * A single on/off setting, rendered as a Material settings row: the setting's
 * name and supporting text sit on the left, the checkbox on the right, and the
 * whole row is the checkbox's label so clicking anywhere toggles it.
 *
 * Use this over `f-setting-toggle` when the setting reads as including something
 * in a set rather than switching a capability on and off.
 */
@Component({
  selector: 'f-setting-checkbox',
  templateUrl: './setting-checkbox.component.html',
  styleUrls: ['./setting-checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
  host: {class: 'block'},
})
export class SettingCheckboxComponent {
  /** Short, sentence case name of the setting. */
  public readonly label = input.required<string>();

  /** The state of the setting. Supports two way binding. */
  public readonly checked = model<boolean>(false);

  public readonly disabled = input<boolean>(false);

  /** Emitted when the user toggles the setting. */
  public readonly changed = output<MatCheckboxChange>();

  protected onChange(event: MatCheckboxChange): void {
    this.checked.set(event.checked);
    this.changed.emit(event);
  }
}
