import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';
import {Observable, Subscription} from 'rxjs';
import {DiscussionPrompt} from 'src/app/api/models/discussion-prompt';
import {Task} from 'src/app/api/models/task';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {TaskPrerequisite} from 'src/app/api/models/task-prerequisite';
import {Unit} from 'src/app/api/models/unit';
import {DiscussionPromptService} from 'src/app/api/services/discussion-prompt.service';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {TaskPrerequisiteService} from 'src/app/api/services/task-prerequisite.service';
import {EntityFormComponent} from 'src/app/common/entity-form/entity-form.component';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-task-definition-discussion-prompts',
  templateUrl: 'task-definition-discussion-prompts.component.html',
  styleUrls: ['task-definition-discussion-prompts.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDefinitionDiscussionPromptsComponent
  extends EntityFormComponent<DiscussionPrompt>
  implements OnInit, OnChanges
{
  @Input() taskDefinition: TaskDefinition;
  @Input() staffView: boolean;
  @Input() task: Task;

  displayedColumns: string[] = ['content', 'priority', 'actions'];

  private prereqSub?: Subscription;

  public dataSource: MatTableDataSource<DiscussionPrompt> = new MatTableDataSource();

  creatingNewDiscussionPrompt: boolean = false;

  newDiscussionPromptContent: string;
  newDiscussionPromptWeight: number = 2;

  constructor(
    private taskDefinitionService: TaskDefinitionService,
    private alertService: AlertService,
    private taskPrerequisiteService: TaskPrerequisiteService,
    private discussionPromptService: DiscussionPromptService,
  ) {
    super(
      {
        content: new UntypedFormControl('', [Validators.required]),
        priority: new UntypedFormControl('', [Validators.required]),
      },
      'Discussion Prompt',
    );
  }
  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  public get prerequisites(): Observable<TaskPrerequisite[]> {
    return this.taskDefinition.taskPrerequisitesCache.values;
  }

  ngOnInit(): void {
    this.prereqSub = this.taskDefinition.discussionPromptsCache.values.subscribe((values) => {
      this.dataSource.data = values;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.taskDefinition &&
      changes.taskDefinition.previousValue?.id !== changes.taskDefinition.currentValue?.id
    ) {
      this.prereqSub?.unsubscribe();
      this.prereqSub = this.taskDefinition.discussionPromptsCache.values.subscribe((values) => {
        this.dataSource.data = values;
      });
      this.fetchDiscussionPrompts();
    }
  }

  private fetchDiscussionPrompts() {
    const taskDefinition = this.taskDefinition;
    if (!taskDefinition.id) {
      return;
    }
    this.discussionPromptService.loadDiscussionPrompts(null, taskDefinition).subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (error) => {
        this.alertService.error(`Failed to load discussion prompts: ${error}`, 6000);
      },
    });
  }

  public addNewPrompt() {
    const content = this.newDiscussionPromptContent;
    const priority = this.newDiscussionPromptWeight;
    this.discussionPromptService
      .create(
        {
          task_definition_id: this.taskDefinition.id,
          content: content,
          priority: priority,
        },
        {
          cache: this.taskDefinition.discussionPromptsCache,
          constructorParams: this.taskDefinition,
        },
      )
      .subscribe({
        next: (_result) => {
          this.cancelNewDiscussionPrompt();
          this.prereqSub?.unsubscribe();
          this.prereqSub = this.taskDefinition.discussionPromptsCache.values.subscribe((values) => {
            this.dataSource.data = values;
          });
          this.alertService.success(`Succesfully created prompt`, 3000);
        },
        error: (error) => {
          this.alertService.error(`Failed to create prompt: ${error}`, 6000);
        },
      });
  }

  public deletePrompt(prompt: DiscussionPrompt) {
    prompt.delete();
  }

  createNewDiscussionPrompt() {
    this.creatingNewDiscussionPrompt = true;
  }

  cancelNewDiscussionPrompt() {
    this.creatingNewDiscussionPrompt = false;
    this.newDiscussionPromptContent = '';
    this.newDiscussionPromptWeight = 2;
  }

  submit() {
    this.discussionPromptService
      .put({
        id: this.selected.id,
        task_definition_id: this.taskDefinition.id,
        content: this.selected.content,
        priority: this.selected.priority,
      })
      .subscribe({
        next: (_response) => {
          this.cancelEdit();
          this.alertService.success('Successfully saved prompt', 3000);
        },
        error: (error) => {
          this.alertService.error(`Failed to update prompt: ${error}`, 6000);
        },
      });
  }
}
