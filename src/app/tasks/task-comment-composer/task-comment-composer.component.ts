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
} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { analyticsService, alertService } from 'src/app/ajs-upgraded-providers';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { EmojiSearch } from '@ctrl/ngx-emoji-mart';
import { EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji/';
import { EmojiService } from 'src/app/common/services/emoji.service';
import { Task, TaskComment, TaskCommentService } from 'src/app/api/models/doubtfire-model';
import { TaskCommentsViewerComponent } from '../task-comments-viewer/task-comments-viewer.component';
import { BehaviorSubject } from 'rxjs';

/**
 * The task comment viewer needs to share data with the Task Comment Composer. The data needed
 * id defined through this interface.
 */
export interface TaskCommentComposerData {
  originalComment: TaskComment;
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
      transition('true => false', [style({ width: 14 }), animate('150ms 0ms ease-in-out', style({ width: 96 }))]),
      transition('false => true', [style({ width: 96 }), animate('150ms 0ms ease-in-out', style({ width: 14 }))]),
    ]),
  ],
})
export class TaskCommentComposerComponent implements DoCheck {
  @Input() task: Task;
  @Input() sharedData: TaskCommentComposerData;

  public $expandInput = new BehaviorSubject<boolean>(false);

  comment = {
    text: '',
    type: 'text',
  };

  @ViewChildren('commentInput') input: QueryList<ElementRef>;
  @ViewChild('uploader') uploader: ElementRef;

  differ: KeyValueDiffer<string, any>;
  showEmojiPicker: boolean = false;
  emojiSearchMode: boolean = false;
  emojiRegex: RegExp = /(?:\:)(.*?)(?=\:|$)/;
  emojiSearchResults: EmojiData[] = [];
  emojiMatch: string;
  recording = false;

  constructor(
    private differs: KeyValueDiffers,
    public dialog: MatDialog,
    private emojiSearch: EmojiSearch,
    private emojiService: EmojiService,
    private commentsViewer: TaskCommentsViewerComponent,
    @Inject(analyticsService) private analytics: any,
    @Inject(alertService) private alerts: any,
    @Inject(TaskCommentService) private taskCommentService: TaskCommentService
  ) {
    this.differ = this.differs.find({}).create();
  }

  ngDoCheck() {
    // Check to see if the sharedData has changed
    const change = this.differ.diff(this.sharedData);
    if (change) {
      change.forEachChangedItem((item) => {
        // If it has changed to be an actual comment
        if (item != null) {
          // Set the input field as focused, so the user can start typing
          // timeout is required
          setTimeout(() => {
            this.input.first.nativeElement.focus();
          });
        }
      });
    }
  }

  get originalComment(): TaskComment {
    return this.sharedData.originalComment;
  }

  get isStaff() {
    return this.task?.unit?.currentUserIsStaff;
  }

  cancelReply() {
    this.sharedData.originalComment = null;
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
    this.$expandInput.next(true);
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
      emoji
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

  addEmoji(e: string | Event): void;
  addEmoji(e: any): void {
    let char: string;
    if (typeof e === 'string') {
      char = e;
    } else {
      char = e.emoji.native;
    }
    const text = this.input.first.nativeElement.innerText;
    const position = this.caretOffset();
    this.input.first.nativeElement.innerText = [text.slice(0, position), char, text.slice(position)].join('');
  }

  openDiscussionComposer() {
    const self = this;

    let dialogRef: MatDialogRef<DiscussionComposerDialog, any>;

    dialogRef = this.dialog.open(DiscussionComposerDialog, {
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
    const originalComment = this.sharedData.originalComment;
    if (originalComment != null) {
      this.cancelReply();
    }
    const text = this.emojiService.nativeEmojiToColons(this.input.first.nativeElement.innerText);

    this.taskCommentService.addComment(this.task, text, 'text', originalComment).subscribe(
      (tc: TaskComment) => {
        this.input.first.nativeElement.innerText = '';
      },
      (error: any) => {
        this.alerts.add('danger', error || error?.message, 2000);
      }
    );
  }

  addCommentWithType(comment: string, type: string) {
    this.taskCommentService.addComment(
      this.task,
      comment,
      type).subscribe({
        next: (success: TaskComment) => {
          this.comment.text = '';
          this.commentsViewer.scrollDown();
          console.log("implement - check map comments");
          //this.task.comments = this.ts.mapComments(this.task.comments);
        },
        error: (message: string) => this.alerts.add('danger', message, 6000)
      });
  }

  openFile() {
    this.uploader.nativeElement.click();
  }

  uploadFiles(event) {
    [...event].forEach((file) => {
      if (ACCEPTED_FILE_TYPES.includes(file.type) || file.type.startsWith('audio/') || file.type.startsWith('image/')) {
        this.postAttachmentComment(file);
      } else {
        this.alerts.add('danger', 'I cannot upload that file - only images, audio, and PDFs.', 4000);
      }
    });
  }

  // # Upload image files as comments to a given task
  postAttachmentComment(file) {
    this.taskCommentService.addComment(this.task, file, 'file', null).subscribe(
      (tc: TaskComment) => {
        this.commentsViewer.scrollDown();
      },
      (error: any) => {
        this.alerts.add('danger', error || error?.message, 2000);
      }
    );
  }
}

// The discussion prompt composer dialog Component
// eslint-disable-next-line max-classes-per-file
@Component({
  selector: 'discussion-prompt-composer-dialog.html',
  templateUrl: 'discussion-prompt-composer-dialog.html',
  styleUrls: ['./discussion-prompt-composer/discussion-prompt-composer.component.scss'],
})
export class DiscussionComposerDialog implements OnInit {
  constructor(public dialogRef: MatDialogRef<DiscussionComposerDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() { }
}
