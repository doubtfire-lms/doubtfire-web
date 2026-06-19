import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {DiscussionPrompt} from 'src/app/api/models/discussion-prompt';
import {Project, TaskDefinition, UserService} from 'src/app/api/models/doubtfire-model';
import {StaffNote} from 'src/app/api/models/staff-note';
import {DiscussionPromptService} from 'src/app/api/services/discussion-prompt.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-discussion-prompts',
  templateUrl: './discussion-prompts.component.html',
  styleUrl: './discussion-prompts.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DiscussionPromptsComponent implements OnInit {
  @ViewChild('staffNotesContainer') staffNotesContainer!: ElementRef;
  @ViewChild('staffNoteEditor', {static: false}) staffNoteEditor!: ElementRef<HTMLTextAreaElement>;

  @Input() project: Project;
  @Input() taskDefinition: TaskDefinition;

  loadingStaffNotes: boolean = true;

  noteText: string = '';

  editingNote?: StaffNote;
  editingNoteText?: string = '';

  replyingToNote?: StaffNote;

  hoveredNoteId: number | null = null;

  discussionPrompts: DiscussionPrompt[] = [];

  constructor(
    private userService: UserService,
    private discussionPromptService: DiscussionPromptService,
    private alertService: AlertService,
    private confirmationModalService: ConfirmationModalService,
  ) {}
  ngOnInit(): void {
    console.log('task def?', this.taskDefinition);
    this.loadingStaffNotes = true;
    this.discussionPromptService
      .loadDiscussionPromptsForPoject(this.project)
      .subscribe((prompts) => {
        console.log(prompts);
        this.discussionPrompts = prompts;
      });
  }
}
