import { Component, Input } from '@angular/core';
import { Stage } from 'src/app/api/models/doubtfire-model';

/**
 * The Stage editor component will edit a single stage. Allowing you to set the
 * transition messages, and add criterion
 *
 * Input: stage - the stage to be built
 */
@Component({
  selector: 'stage-editor',
  templateUrl: 'stage-editor.component.html',
  styleUrls: ['stage-editor.component.scss'],
})
export class StageEditorComponent {
  @Input() stage: Stage;
}
