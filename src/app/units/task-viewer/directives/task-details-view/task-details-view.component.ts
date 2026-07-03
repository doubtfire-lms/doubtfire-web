import {FlexModule} from 'ng-flex-layout/flex';
import {ChangeDetectionStrategy, Component, Input, signal} from '@angular/core';
import {
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import {MatIcon} from '@angular/material/icon';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {TaskDescriptionCardComponent} from '../../../../projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.component';

@Component({
  selector: 'f-task-details-view',
  templateUrl: './task-details-view.component.html',
  styleUrls: ['./task-details-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    TaskDescriptionCardComponent,
    FlexModule,
    MatIcon,
  ],
})
export class FTaskDetailsViewComponent {
  @Input() taskDef: TaskDefinition;
  @Input() unit: Unit;

  public readonly panelOpenState = signal(false);
}
