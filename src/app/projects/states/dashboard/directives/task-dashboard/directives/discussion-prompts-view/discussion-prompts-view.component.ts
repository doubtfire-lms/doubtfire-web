import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {DiscussionPromptsComponent} from '../../../../../discussion-prompts/discussion-prompts.component';

@Component({
  selector: 'f-discussion-prompts-view',
  templateUrl: './discussion-prompts-view.component.html',
  styleUrls: ['./discussion-prompts-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIcon, DiscussionPromptsComponent],
})
export class DiscussionPromptsViewComponent {
  @Input() project;
  @Input() taskDefinition;
}
