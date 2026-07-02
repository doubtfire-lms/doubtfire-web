import {EmojiSearch} from '@ctrl/ngx-emoji-mart';
import {EmojiData} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {animate, style, transition, trigger} from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Inject,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  OnChanges,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject, Subscription} from 'rxjs';
import {
  FeedbackTemplate,
  Task,
  TaskComment,
  TaskCommentService,
} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {EmojiService} from 'src/app/common/services/emoji.service';
import {TaskCommentsViewerComponent} from '../task-comments-viewer/task-comments-viewer.component';
import {AttachmentConfirmationDialogComponent} from './attachment-confirmation-dialog/attachment-confirmation-dialog.component';

interface ApiError {
  error?: string;
  message?: string;
  status?: number;
}

/**
 * The task comment viewer needs to share data with the Task Comment Composer. The data needed
 * id defined through this interface.
 */

export interface TaskCommentComposerData {
  [key: string]: TaskComment;
  originalComment: TaskComment;
  editingComment: TaskComment;
}

const ACCEPTED_FILE_TYPES = [
  'audio/mpeg',
  'audio/vorbis',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'image/png',
  'image/pdf',
  'application/pdf',
  'image/gif',
  'image/jpg',
  'image/jpeg',
];

/**
 * The task comment composer is responsible for creating and adding comments to a given task.
 */
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
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskCommentComposerComponent implements AfterViewInit, DoCheck, OnChanges {
  @Input() task: Task;
  @Input() sharedData: TaskCommentComposerData;

  public $userIsTyping: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private draftSaveSubscription = new Subscription();
  private readonly DRAFT_KEY_PREFIX = 'task_comment_draft_';
  public isDraftLoaded = false;
  private submittedTaskIds: Set<number | string> = new Set();

  public isSending: boolean = false;
  private draftBeforeEdit: string = '';

  comment = {
    text: '',
    type: 'text',
  };

  @ViewChildren('commentInput') input: QueryList<ElementRef>;
  @ViewChildren('cag') cag: QueryList<ElementRef>;
  @ViewChild('uploader') uploader: ElementRef;

  differ: KeyValueDiffer<string, TaskComment>;
  showEmojiPicker = false;
  emojiSearchMode = false;
  // eslint-disable-next-line no-useless-escape
  emojiRegex: RegExp = /(?:\:)(.*?)(?=\:|$)/;
  emojiSearchResults: EmojiData[] = [];
  emojiMatch: string;
  showFeedbackTemplatePicker: boolean = false;
  recording = false;
  cagStartWidth: number;

  constructor(
    private differs: KeyValueDiffers,
    public dialog: MatDialog,
    private emojiSearch: EmojiSearch,
    private emojiService: EmojiService,
    private commentsViewer: TaskCommentsViewerComponent,
    private alerts: AlertService,
    @Inject(TaskCommentService) private taskCommentService: TaskCommentService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.differ = this.differs.find({}).create();
    // submitted tasks from sessionStorage
    try {
      const saved = sessionStorage.getItem('task_comments_submitted');
      if (saved) {
        this.submittedTaskIds = new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading submitted tasks:', e);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.showFeedbackTemplatePicker = false;

    if (changes.task && changes.task.currentValue !== changes.task.previousValue) {
      const newTask = changes.task.currentValue as Task;
      // Check if the task has changed

      this.cancelEdit();
      this.cancelReply();

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

  // ngOnDestroy() {
  //   if (this.task?.id) {
  //     try {
  //       const inputElement = this.input?.first?.nativeElement;
  //       if (inputElement) {
  //         const text = inputElement.innerText.trim();
  //         if (text && !this.hasSubmittedComment) {
  //           localStorage.setItem(this.getDraftKey(this.task), text);
  //         } else {
  //         }
  //       }
  //     } catch (error) {}
  //   }
  // }

  // Update onInputChange to reset submitted status
  onInputChange(event: Event) {
    if (this.isEditing) {
      return;
    }

    const target = event.target as HTMLElement;
    const text = target.innerText;
    const _raw = target.innerText;

    // If user is typing something new after submission, reset the submitted status
    if (this.task) {
      const taskKey =
        this.task.id ||
        `${this.task.projectId || this.task.project?.id}_${this.task.definition?.id}`;

      // If this was a previously submitted task and user is typing again,
      // remove from submitted set
      if (this.submittedTaskIds.has(taskKey) && text.trim()) {
        this.submittedTaskIds.delete(taskKey);

        // Update session storage
        try {
          sessionStorage.setItem(
            'task_comments_submitted',
            JSON.stringify([...this.submittedTaskIds]),
          );
        } catch (e) {
          console.error('Error saving submitted tasks:', e);
        }
      }

      const _draftKey = this.getDraftKey(this.task);
      // this.taskDraftContents.set(draftKey, raw);
    }

    this.saveCurrentDraft();
  }

  private getDraftKey(task: Task): string {
    // If task has an ID, use it
    if (task.id) {
      return `${this.DRAFT_KEY_PREFIX}${task.id}`;
    }

    // For "not started" tasks, create a composite key using only valid properties
    const projectId = task.projectId || task.project?.id || 'unknown';
    // Fix: Use task.definition.id instead of task.definition_id
    const definitionId = task.definition?.id || 'unknown';

    return `${this.DRAFT_KEY_PREFIX}${projectId}_${definitionId}`;
  }

  private hasContent(raw: string): boolean {
    return raw.replace(/\s+/g, '').length > 0;
  }

  // Update saveDraftForTask to use the taskDraftContents map
  private saveDraftForTask(task: Task, _rawFromDom?: string): void {
    if (!task) {
      return;
    }

    const draftKey = this.getDraftKey(task);

    try {
      let raw: string;
      if (this.task?.id === task.id && this.input.first) {
        raw = this.input.first.nativeElement.innerText;
      } else {
        // raw = this.taskDraftContents.get(draftKey) ?? '';
      }

      if (!this.hasContent(raw)) {
        // No text to save, removing draft from localStorage
        // this.taskDraftContents.delete(draftKey);
        localStorage.removeItem(draftKey);
        return;
      }

      const text = raw.trim();
      // Save comment draf
      // this.taskDraftContents.set(draftKey, text);
      localStorage.setItem(draftKey, text);
    } catch (error) {
      console.error('saveDraftForTask error:', error);
    }
  }

  private loadDraftForTask(task: Task) {
    if (!task) {
      return;
    }

    const taskKey = task.id || `${task.projectId || task.project?.id}_${task.definition?.id}`;

    if (this.submittedTaskIds.has(taskKey)) {
      return;
    }

    const draftKey = this.getDraftKey(task);
    try {
      const draft = localStorage.getItem(draftKey);

      if (!draft) {
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
        // this.taskDraftContents.set(draftKey, draft);
        this.isDraftLoaded = true;
        this.cdRef.detectChanges();

        setTimeout(() => {
          this.isDraftLoaded = false;
          this.cdRef.detectChanges();
        }, 1500);
      };

      retryWithTimeout();
    } catch (error) {
      console.error(error);
    }
  }

  private clearInput() {
    if (this.input?.first?.nativeElement) {
      this.input.first.nativeElement.innerText = '';
      this.cdRef.detectChanges();
    }
  }

  private saveCurrentDraft() {
    if (!this.task) {
      return;
    }
    this.saveDraftForTask(this.task);
  }

  ngDoCheck() {
    // Check to see if the sharedData has changed
    const change = this.differ.diff(this.sharedData);
    if (change) {
      change.forEachChangedItem((item) => {
        // If it has changed to be an actual comment
        if (item != null) {
          this.syncComposerState();
        }
      });
    }
  }

  get originalComment(): TaskComment {
    return this.sharedData.originalComment;
  }

  get editingComment(): TaskComment {
    return this.sharedData.editingComment;
  }

  get isEditing(): boolean {
    return this.editingComment != null;
  }

  get isStaff() {
    return this.task?.unit?.currentUserIsStaff;
  }

  cancelReply() {
    this.sharedData.originalComment = null;
  }

  cancelEdit() {
    this.sharedData.editingComment = null;
    this.restoreDraftAfterEdit();
  }

  contentEditableValue() {
    const UA = navigator.userAgent;
    const isWebkit = /WebKit/.test(UA) && !/Edge/.test(UA);
    return isWebkit ? 'plaintext-only' : 'true';
  }

  formatImageName(imageName) {
    const index = imageName.indexOf('.');
    let nameString = imageName.substring(0, index);
    const typeString = imageName.substring(index);

    if (nameString.length > 20) {
      nameString = nameString.substring(0, 20) + '..';
    }

    const finalString = nameString + typeString;
    return finalString;
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
      if (this.isEditing) {
        this.saveEditedComment();
      } else {
        this.addComment();
      }
    }
  }

  keyTyped() {
    setTimeout(() => {
      const commentText: string = this.input.first.nativeElement.innerText;
      this.emojiSearchMode = !commentText.includes('`') && this.emojiRegex.test(commentText);

      if (this.emojiSearchMode) {
        // get the cursor position in the content-editable
        const cursorPosition = this.caretOffset();

        // get the text from the start of the string up to the cursor.
        const testText = commentText.slice(0, cursorPosition);

        // within this smaller string, find the last :
        const lastColPos = testText.lastIndexOf(':');

        // The emoji search term will be from the position after the last :
        // Note, the second parameter is a length not position, so we subtract.
        this.emojiMatch = testText.substr(lastColPos + 1, cursorPosition - lastColPos);

        if (this.emojiMatch?.includes(' ')) {
          this.emojiSearchMode = false;
          this.emojiSearchResults = null;
        } else {
          // results is the list of emoji returned.
          const results = this.emojiSearch.search(this.emojiMatch);
          if (results?.length > 0) {
            this.emojiSearchResults = results.slice(0, 15);
          }
        }
      } // timeout to ensure that the inner html is updated with the new character.
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
    let caretOffset: number = 0;
    const doc = element.ownerDocument || element.document;
    const win = doc.defaultView || doc.parentWindow;
    let sel;
    if (typeof win.getSelection !== 'undefined') {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
        const range = win.getSelection().getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    } else if (sel === doc.selection && sel.type !== 'Control') {
      const textRange = sel.createRange();
      const preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint('EndToEnd', textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  }

  addEmoji(e): void {
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

  addFeedback(template: FeedbackTemplate): void {
    const char = template.commentText;
    const text = this.input.first.nativeElement.innerText;
    const position = this.caretOffset();
    this.input.first.nativeElement.innerText = [
      text.slice(0, position),
      char,
      text.slice(position),
    ].join('');
    this.input.first.nativeElement.focus();
    setTimeout(() => {
      this.saveDraftForTask(this.task);
    });
  }

  openDiscussionComposer() {
    this.dialog.open(DiscussionComposerDialog, {
      data: {
        task: this.task,
      },
      maxWidth: '800px',
      disableClose: true,
    });

    // dialogRef.afterOpened().subscribe((result: any) => {
    // });

    // dialogRef.afterClosed().subscribe((result: any) => {
    // });
  }

  addComment() {
    if (this.isSending) {
      return;
    }
    this.isSending = true;

    const originalComment = this.sharedData.originalComment;
    if (originalComment != null) {
      this.cancelReply();
    }

    const text = this.emojiService.nativeEmojiToColons(this.input.first.nativeElement.innerText);

    const taskKey =
      this.task.id || `${this.task.projectId || this.task.project?.id}_${this.task.definition?.id}`;

    const draftKey = this.getDraftKey(this.task);
    this.taskCommentService.addComment(this.task, text, 'text', originalComment).subscribe({
      next: (_tc: TaskComment) => {
        this.isSending = false;

        this.submittedTaskIds.add(taskKey);

        try {
          sessionStorage.setItem(
            'task_comments_submitted',
            JSON.stringify([...this.submittedTaskIds]),
          );
        } catch (e) {
          console.error('Error saving submitted tasks:', e);
        }

        if (this.task) {
          localStorage.removeItem(draftKey);
        }

        this.input.first.nativeElement.innerText = '';
      },
      error: (error: ApiError) => {
        this.isSending = false;
        this.alerts.error(error.error || error.message || `Failed to add comment: ${error}`, 6000);
      },
    });
  }

  saveEditedComment() {
    if (this.isSending || !this.editingComment) {
      return;
    }

    this.isSending = true;
    const text = this.emojiService.nativeEmojiToColons(this.input.first.nativeElement.innerText);

    this.taskCommentService.editComment(this.editingComment, text).subscribe({
      next: (_tc: TaskComment) => {
        this.isSending = false;
        this.sharedData.editingComment = null;
        this.draftBeforeEdit = '';
        this.clearInput();
      },
      error: (error: ApiError) => {
        this.isSending = false;
        this.alerts.error(error.error || error.message || `Failed to edit comment: ${error}`, 6000);
      },
    });
  }

  addCommentWithType(comment: string, type: string) {
    this.taskCommentService.addComment(this.task, comment, type).subscribe({
      next: (_success: TaskComment) => {
        this.comment.text = '';
        this.commentsViewer.scrollDown();
        console.log('implement - check map comments');
        //this.task.comments = this.ts.mapComments(this.task.comments);
      },
      error: (message: string) => this.alerts.error(message, 6000),
    });
  }

  openFile() {
    this.uploader.nativeElement.click();
  }

  handlePaste(event: ClipboardEvent) {
    const files = this.getClipboardFiles(event);

    if (files.length === 0) {
      return;
    }

    const existingText = this.input?.first?.nativeElement?.innerText ?? '';
    event.preventDefault();
    this.clearPastedPlaceholderContent(existingText);
    this.uploadFiles(files);
  }

  handleBeforeInput(event: InputEvent) {
    if (event.inputType !== 'insertFromPaste') {
      return;
    }

    const files = Array.from(event.dataTransfer?.files ?? []);

    if (files.length === 0) {
      return;
    }

    const existingText = this.input?.first?.nativeElement?.innerText ?? '';
    event.preventDefault();
    this.clearPastedPlaceholderContent(existingText);
    this.uploadFiles(files);
  }

  uploadFiles(files: ArrayLike<File>) {
    const acceptedFiles: File[] = [];

    Array.from(files).forEach((file) => {
      if (
        ACCEPTED_FILE_TYPES.includes(file.type) ||
        file.type.startsWith('audio/') ||
        file.type.startsWith('image/')
      ) {
        acceptedFiles.push(file);
      } else {
        this.alerts.error('Cannot upload that file - only images, audio, and PDFs.', 4000);
      }
    });

    this.confirmAttachmentsSequentially(acceptedFiles);
    this.resetUploader();
  }

  private getClipboardFiles(event: ClipboardEvent): File[] {
    const clipboardData = event.clipboardData;

    if (!clipboardData) {
      return [];
    }

    const directFiles = Array.from(clipboardData.files ?? []);
    if (directFiles.length > 0) {
      return directFiles;
    }

    return Array.from(clipboardData.items ?? [])
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter((file): file is File => file != null);
  }

  private clearPastedPlaceholderContent(existingText: string) {
    if (!this.input?.first?.nativeElement) {
      return;
    }

    // Let the browser finish the paste event lifecycle, then restore the pre-paste text
    // so clipboard attachment placeholders do not replace an in-progress draft.
    setTimeout(() => {
      this.input.first.nativeElement.innerText = existingText;
      this.saveCurrentDraft();
      this.cdRef.detectChanges();
    });
  }

  // # Upload image files as comments to a given task
  postAttachmentComment(file) {
    this.taskCommentService.addComment(this.task, file, 'file', null).subscribe(
      (_tc: TaskComment) => {
        this.commentsViewer.scrollDown();
      },
      (error: Error) => {
        this.alerts.error(error.message, 2000);
      },
    );
  }

  private confirmAttachmentsSequentially(files: File[], index: number = 0) {
    if (index >= files.length) {
      return;
    }

    const dialogRef = this.dialog.open(AttachmentConfirmationDialogComponent, {
      data: {
        file: files[index],
      },
      maxWidth: '720px',
      width: 'min(92vw, 720px)',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.postAttachmentComment(files[index]);
      }

      this.confirmAttachmentsSequentially(files, index + 1);
    });
  }

  private resetUploader() {
    if (this.uploader?.nativeElement) {
      this.uploader.nativeElement.value = '';
    }
  }

  showFeedbackPicker() {
    this.showFeedbackTemplatePicker = !this.showFeedbackTemplatePicker;
    this.commentsViewer.scrollDown();
  }

  private syncComposerState() {
    if (this.isEditing) {
      this.beginEditingComment();
      return;
    }

    setTimeout(() => {
      this.input.first.nativeElement.focus();
    });
  }

  private beginEditingComment() {
    const currentText = this.input?.first?.nativeElement?.innerText ?? '';
    const nextText = this.editingComment?.text ?? '';

    if (this.sharedData.originalComment != null) {
      this.sharedData.originalComment = null;
    }

    if (currentText !== nextText) {
      this.draftBeforeEdit = currentText;
      this.setComposerText(nextText);
    }

    setTimeout(() => {
      this.focusComposerAtEnd();
    });
  }

  private restoreDraftAfterEdit() {
    const draft = this.draftBeforeEdit;
    this.draftBeforeEdit = '';
    this.setComposerText(draft);
  }

  private setComposerText(text: string) {
    if (!this.input?.first?.nativeElement) {
      return;
    }

    this.input.first.nativeElement.innerText = text;
    this.cdRef.detectChanges();
  }

  private focusComposerAtEnd() {
    const element = this.input?.first?.nativeElement;
    if (!element) {
      return;
    }

    element.focus();

    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// The discussion prompt composer dialog Component
// eslint-disable-next-line max-classes-per-file
@Component({
  selector: 'discussion-prompt-composer-dialog.html',
  templateUrl: 'discussion-prompt-composer-dialog.html',
  styleUrls: ['./discussion-prompt-composer/discussion-prompt-composer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DiscussionComposerDialog {
  constructor(
    public dialogRef: MatDialogRef<DiscussionComposerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {task: Task},
  ) {}
}
