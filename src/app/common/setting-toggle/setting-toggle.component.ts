import {ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';

/**
 * A single on/off setting, rendered as a Material settings row: the setting's
 * name and supporting text sit on the left, the switch on the right, and the
 * whole row is the switch's label so clicking anywhere toggles it.
 *
 * The supporting text is projected as content:
 *
 * ```html
 * <f-setting-toggle label="Active" [(checked)]="unit.active">
 *   Set to false to hide the unit from students and tutors.
 * </f-setting-toggle>
 * ```
 */
@Component({
  selector: 'f-setting-toggle',
  templateUrl: './setting-toggle.component.html',
  styleUrls: ['./setting-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
  host: {class: 'block'},
})
export class SettingToggleComponent {
  /** Short, sentence case name of the setting. */
  public readonly label = input.required<string>();

  /** The state of the setting. Supports two way binding. */
  public readonly checked = model<boolean>(false);

  public readonly disabled = input<boolean>(false);

  /** Emitted when the user toggles the setting. */
  public readonly changed = output<MatSlideToggleChange>();

  protected onChange(event: MatSlideToggleChange): void {
    this.checked.set(event.checked);
    this.changed.emit(event);
  }
}
