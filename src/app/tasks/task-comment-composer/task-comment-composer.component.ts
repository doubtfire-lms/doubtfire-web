import {
  Component,
  OnInit,
  Inject,
  Input,
  ViewChildren,
  QueryList,
  KeyValueDiffers,
  KeyValueDiffer,
  ElementRef,
  ViewChild,
  DoCheck,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {trigger, style, animate, transition} from '@angular/animations';
import {analyticsService} from 'src/app/ajs-upgraded-providers';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {EmojiSearch} from '@ctrl/ngx-emoji-mart';
import {EmojiData} from '@ctrl/ngx-emoji-mart/ngx-emoji/';
import {EmojiService} from 'src/app/common/services/emoji.service';
import {Task, TaskComment, TaskCommentService} from 'src/app/api/models/doubtfire-model';
import {TaskCommentsViewerComponent} from '../task-comments-viewer/task-comments-viewer.component';
import {BehaviorSubject, Subscription} from 'rxjs';
import {AlertService} from 'src/app/common/services/alert.service';

interface ApiError {
  error?: string;
  message?: string;
  status?: number;
}

export interface TaskCommentComposerData {
  originalComment: TaskComment;
}

const ACCEPTED_FILE_TYPES = [
  'audio/mpeg', 'audio/vorbis', 'audio/mp4', 'audio/ogg',
  'audio/wav', 'audio/x-wav', 'audio/webm', 'image/png',
  'image/pdf', 'application/pdf', 'image/gif', 'image/jpg',
  'image/jpeg'
];

@Component({
  selector: 'task-comment-composer',
  templateUrl: './task-comment-composer.component.html',
  styleUrls: ['./task-comment-composer.component.scss'],
  animations: [
    trigger('shrinkgrow', [
      transition('true => false', [style({width: 38.4}), animate('150ms 0ms ease-in-out')]),
      transition('false => true', [style({width: 80}), animate('150ms 0ms ease-in-out')]),
    ]),
  ],
})
export class TaskCommentComposerComponent
  implements OnInit, AfterViewInit, DoCheck, OnDestroy, OnChanges
{
  @Input() task: Task;
  @Input() sharedData: TaskCommentComposerData;

  public $userIsTyping = new BehaviorSubject<boolean>(false);
  private draftSaveSubscription = new Subscription();
  private readonly DRAFT_KEY_PREFIX = 'task_comment_draft_';
  public isDraftLoaded = false;
  private previousTaskId: number;
  private hasSubmittedComment = false;
  private submittedTaskIds: Set<number | string> = new Set();

  comment = { text: '', type: 'text' };
  showEmojiPicker = false;
  emojiSearchMode = false;
  emojiRegex: RegExp = /(?:\:)(.*?)(?=\:|$)/;
  emojiSearchResults: EmojiData[] = [];
  emojiMatch: string;
  recording = false;

  @ViewChildren('commentInput') input: QueryList<ElementRef>;
  @ViewChildren('cag') cag: QueryList<ElementRef>;
  @ViewChild('uploader') uploader: ElementRef;

  differ: KeyValueDiffer<string, any>;

  // Add a task content map to store text per task
  private taskDraftContents: Map<string, string> = new Map();

  constructor(
    private differs: KeyValueDiffers,
    public dialog: MatDialog,
    private emojiSearch: EmojiSearch,
    private emojiService: EmojiService,
    private commentsViewer: TaskCommentsViewerComponent,
    @Inject(analyticsService) private analytics,
    private alerts: AlertService,
    @Inject(TaskCommentService) private taskCommentService: TaskCommentService,
    private cdRef: ChangeDetectorRef
  ) {
    this.differ = this.differs.find({}).create();
    // Initialize submitted tasks from sessionStorage
    try {
      const saved = sessionStorage.getItem('task_comments_submitted');
      if (saved) {
        this.submittedTaskIds = new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading submitted tasks:', e);
    }
  }

  ngOnInit() {
    window.addEventListener('storage', (event) => {
      console.log('[STORAGE-EVENT]', event);
    });
    this.testLocalStorage();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.task && changes.task.currentValue !== changes.task.previousValue) {
      const newTask = changes.task.currentValue;
      const previousTask = changes.task.previousValue;

      if (previousTask && !this.hasSubmittedComment) {
        this.saveDraftForTask(previousTask);
      }

      this.hasSubmittedComment = false;

      this.previousTaskId = newTask?.id;

      this.clearInput();

      if (newTask) {
        this.loadDraftForTask(newTask);
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.task?.id) {
        this.loadDraftForTask(this.task);
      }
    }, 100);
  }

  ngOnDestroy() {
    if (this.task?.id) {
      try {
        const inputElement = this.input?.first?.nativeElement;
        if (inputElement) {
          const text = inputElement.innerText.trim();
          console.log('[DRAFT-DEBUG] On destroy, text to save:',
            { taskId: this.task.id, length: text.length, preview: text.substring(0, 20) });

          if (text && !this.hasSubmittedComment) {
            localStorage.setItem(this.getDraftKey(this.task), text);
          } else {
          }
        }
      } catch (error) {
      }
    }
  }

  private testLocalStorage() {
    try {
      const testKey = 'test_draft_' + Date.now();
      localStorage.setItem(testKey, 'test_value');
      const value = localStorage.getItem(testKey);
      console.log('LocalStorage test:', value === 'test_value' ? 'Working' : 'Not working');
      localStorage.removeItem(testKey);
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  }

  contentEditableValue() {
    const UA = navigator.userAgent;
    const isWebkit = /WebKit/.test(UA) && !/Edge/.test(UA);
    return isWebkit ? 'plaintext-only' : 'true';
  }

  get isStaff() {
    return this.task?.unit?.currentUserIsStaff;
  }

  // Update onInputChange to reset submitted status
  onInputChange(event: Event) {
    const target = event.target as HTMLElement;
    const text = target.innerText;

    // If user is typing something new after submission, reset the submitted status
    if (this.task) {
      const taskKey = this.task.id ||
        `${this.task.projectId || this.task.project?.id}_${this.task.definition?.id}`;

      // If this was a previously submitted task and user is typing again,
      // remove from submitted set
      if (this.submittedTaskIds.has(taskKey) && text.trim()) {
        this.submittedTaskIds.delete(taskKey);

        // Update session storage
        try {
          sessionStorage.setItem('task_comments_submitted',
            JSON.stringify([...this.submittedTaskIds]));
        } catch (e) {
          console.error('Error saving submitted tasks:', e);
        }
      }

      const key = this.getDraftKey(this.task);
      this.taskDraftContents.set(key, text);
    }

    this.saveCurrentDraft();
  }

  private getDraftKey(task: Task): string {
    // If task has an ID, use it
    if (task.id) {
      return `${this.DRAFT_KEY_PREFIX}${task.id}`;
    }

    // For "not started" tasks, create a composite key using only valid properties
    const projectId = task.projectId || (task.project?.id) || 'unknown';
    // Fix: Use task.definition.id instead of task.definition_id
    const definitionId = task.definition?.id || 'unknown';

    return `${this.DRAFT_KEY_PREFIX}${projectId}_${definitionId}`;
  }

  // Update saveDraftForTask to use the taskDraftContents map
  private saveDraftForTask(task: Task) {
    if (!task) {
      return;
    }

    try {
      const draftKey = this.getDraftKey(task);

      // Get text from map for this specific task
      let text: string;

      // If it's the current task, get from input directly
      if (this.task && this.task.id === task.id) {
        text = this.input?.first?.nativeElement?.innerText?.trim() || '';
      } else {
        // Otherwise get from our map
        text = this.taskDraftContents.get(draftKey) || '';
      }

      // Rest of the method remains the same
      if (!text) {
        return;
      }


      localStorage.setItem(draftKey, text);
    } catch (error) {
    }
  }

  private loadDraftForTask(task: Task) {
    if (!task) {
      return;
    }

    const taskKey = task.id ||
      `${task.projectId || task.project?.id}_${task.definition?.id}`;

    if (this.submittedTaskIds.has(taskKey)) {
      return;
    }

    const draftKey = this.getDraftKey(task);
    try {
      const draft = localStorage.getItem(draftKey);
      console.log('[DRAFT-DEBUG] Draft found?', draft ? 'Yes' : 'No',
        draft ? { length: draft.length, preview: draft.substring(0, 20) } : '');

      if (!draft) {
        console.log('[DRAFT-DEBUG] No draft found for task', task.id || 'without ID');
        return;
      }

      const maxRetries = 5;
      const retryWithTimeout = (attempt = 0) => {
        if (!this.input || !this.input.first || !this.input.first.nativeElement) {
          if (attempt < maxRetries) {
            setTimeout(() => retryWithTimeout(attempt + 1), 200);
            return;
          } else {
            return;
          }
        }

        this.input.first.nativeElement.innerText = draft;
        this.isDraftLoaded = true;
        this.cdRef.detectChanges();

        setTimeout(() => {
          this.isDraftLoaded = false;
          this.cdRef.detectChanges();
        }, 1500);
      };

      retryWithTimeout();
    } catch (error) {
    }
  }

  private clearInput() {
    if (this.input?.first?.nativeElement) {
      this.input.first.nativeElement.innerText = '';
      this.cdRef.detectChanges();
    }
  }

  private saveCurrentDraft() {
    if (!this.task) return;
    this.saveDraftForTask(this.task);
  }

  ngDoCheck() {
    const change = this.differ.diff(this.sharedData);
    if (change) {
      change.forEachChangedItem((item) => {
        if (item != null) {
          setTimeout(() => {
            this.input.first?.nativeElement?.focus();
          });
        }
      });
    }
  }

  cancelReply() {
    this.sharedData.originalComment = null;
  }

  recordingMode(): void {
    this.recording = !this.recording;
    this.$userIsTyping.next(true);
  }

  send(e: Event) {
    e.preventDefault();
    this.emojiSearchMode = false;
    this.showEmojiPicker = false;
    if (this.input.first.nativeElement.innerText.trim() !== '') {
      this.addComment();
    }
  }

  keyTyped() {
    setTimeout(() => {
      const commentText: string = this.input.first.nativeElement.innerText;
      this.saveCurrentDraft();
      this.emojiSearchMode = !commentText.includes('`') && this.emojiRegex.test(commentText);
      if (this.emojiSearchMode) {
        const cursorPosition = this.caretOffset();
        const testText = commentText.slice(0, cursorPosition);
        const lastColPos = testText.lastIndexOf(':');
        this.emojiMatch = testText.substr(lastColPos + 1, cursorPosition - lastColPos);
        if (this.emojiMatch?.includes(' ')) {
          this.emojiSearchMode = false;
          this.emojiSearchResults = null;
        } else {
          const results = this.emojiSearch.search(this.emojiMatch);
          if (results?.length > 0) {
            this.emojiSearchResults = results.slice(0, 15);
          }
        }
      }
    }, 0);
  }

  emojiSelected(emoji: string) {
    this.input.first.nativeElement.innerText = this.input.first.nativeElement.innerText.replace(
      `:${this.emojiMatch}`,
      emoji,
    );
    this.emojiSearchMode = false;
  }

  private caretOffset() {
    const element = this.input.first.nativeElement;
    let caretOffset = 0;
    const sel = window.getSelection();
    if (sel?.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  }

  addEmoji(e: any) {
    let char: string;
    if (typeof e === 'string') {
      char = e;
    } else {
      char = e.emoji.native;
    }
    const text = this.input.first.nativeElement.innerText;
    const position = this.caretOffset();
    this.input.first.nativeElement.innerText = [
      text.slice(0, position),
      char,
      text.slice(position),
    ].join('');
  }

  openDiscussionComposer() {
    this.dialog.open(DiscussionComposerDialog, {
      data: {
        task: this.task,
      },
      maxWidth: '800px',
      disableClose: true,
    });
  }

  addComment() {


    const originalComment = this.sharedData.originalComment;
    if (originalComment != null) {
      this.cancelReply();

    }

    const text = this.emojiService.nativeEmojiToColons(this.input.first.nativeElement.innerText);
    console.log('[DRAFT-DEBUG] Comment text prepared for submission:', { length: text.length });

    this.hasSubmittedComment = true;



    const taskKey = this.task.id ||
      `${this.task.projectId || this.task.project?.id}_${this.task.definition?.id}`;

    this.submittedTaskIds.add(taskKey);



    try {
      sessionStorage.setItem('task_comments_submitted',
        JSON.stringify([...this.submittedTaskIds]));
    } catch (e) {
      console.error('Error saving submitted tasks:', e);
    }

    if (this.task) {
      localStorage.removeItem(this.getDraftKey(this.task));
      this.previousTaskId = this.task.id;
    }

    this.taskCommentService.addComment(this.task, text, 'text', originalComment).subscribe({
      next: (tc: TaskComment) => {

        const inputEl = this.input.first.nativeElement;
        const originalOnInput = inputEl.oninput;
        inputEl.oninput = null;

        this.input.first.nativeElement.innerText = '';
        console.log('[DRAFT-DEBUG] Cleared input field');

        setTimeout(() => {
          inputEl.oninput = originalOnInput;
        }, 100);


        if (this.task?.id) {
          localStorage.removeItem(this.getDraftKey(this.task));
          console.log('[DRAFT-DEBUG] Double-checked draft removal from localStorage');
        }
      },
      error: (error: ApiError) => {
        console.log('[DRAFT-DEBUG] Error submitting comment:', error);
        this.hasSubmittedComment = false;
        console.log('[DRAFT-DEBUG] Reset hasSubmittedComment flag due to error');

        this.alerts.error(error.error || error.message || 'Failed to add comment', 2000);

        if (this.task?.id) {
          console.log('[DRAFT-DEBUG] Restoring draft due to submission error');
          this.saveDraftForTask(this.task);
        }
      }
    });
  }

  addCommentWithType(comment: string, type: string) {
    this.taskCommentService.addComment(this.task, comment, type).subscribe({
      next: (success: TaskComment) => {
        this.comment.text = '';
        this.commentsViewer.scrollDown();
      },
      error: (message: string) => this.alerts.error(message, 6000),
    });
  }

  openFile() {
    this.uploader.nativeElement.click();
  }

  uploadFiles(event: FileList | any) {
    [...event].forEach((file) => {
      if (
        ACCEPTED_FILE_TYPES.includes(file.type) ||
        file.type.startsWith('audio/') ||
        file.type.startsWith('image/')
      ) {
        this.postAttachmentComment(file);
      } else {
        this.alerts.error('Cannot upload that file - only images, audio, and PDFs.', 4000);
      }
    });
  }

  postAttachmentComment(file: File) {
    this.taskCommentService.addComment(this.task, file, 'file', null).subscribe(
      (tc: TaskComment) => {
        this.commentsViewer.scrollDown();
      },
      (error: any) => {
        this.alerts.error(error || error?.message, 2000);
      },
    );
  }
}

@Component({
  selector: 'discussion-prompt-composer-dialog.html',
  templateUrl: 'discussion-prompt-composer-dialog.html',
  styleUrls: ['./discussion-prompt-composer/discussion-prompt-composer.component.scss'],
})
export class DiscussionComposerDialog implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DiscussionComposerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task },
  ) {}

  ngOnInit() {}
}
