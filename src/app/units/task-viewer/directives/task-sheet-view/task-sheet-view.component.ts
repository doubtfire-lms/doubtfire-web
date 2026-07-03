import {FlexModule} from 'ng-flex-layout/flex';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {fPdfViewerComponent} from '../../../../common/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'f-task-sheet-view',
  templateUrl: './task-sheet-view.component.html',
  styleUrls: ['./task-sheet-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [fPdfViewerComponent, FlexModule, MatIcon],
})
export class FTaskSheetViewComponent {
  @Input() taskDef: TaskDefinition;
}
