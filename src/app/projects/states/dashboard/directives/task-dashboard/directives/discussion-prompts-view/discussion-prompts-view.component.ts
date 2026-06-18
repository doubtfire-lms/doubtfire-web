import {Component, Input} from '@angular/core';

@Component({
  selector: 'f-discussion-prompts-view',
  templateUrl: './discussion-prompts-view.component.html',
  styleUrls: ['./discussion-prompts-view.component.scss'],
  standalone: false,
})
export class DiscussionPromptsViewComponent {
  @Input() project;
  @Input() taskDefinition;
}
