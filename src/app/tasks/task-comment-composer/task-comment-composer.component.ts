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
} from '@angular/core';
import { taskService, analyticsService, alertService } from 'src/app/ajs-upgraded-providers';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmojiSearch } from '@ctrl/ngx-emoji-mart';
import { EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji/';
import { EmojiService } from 'src/app/common/services/emoji.service';

@Component({
  selector: 'task-comment-composer',
  templateUrl: './task-comment-composer.component.html',
  styleUrls: ['./task-comment-composer.component.scss'],
})
export class TaskCommentComposerComponent implements OnInit {
  @Input() task: any = {};
  comment = {
    text: '',
    type: 'text',
  };
  audioPopover: string = 'audioRecorderPopover.html';

  @ViewChildren(PopoverDirective) popovers: QueryList<PopoverDirective>;
  @ViewChildren('commentInput') input: QueryList<ElementRef>;

  commentReplyID: { id: any } = this.ts.currentReplyID;
  differ: KeyValueDiffer<string, any>;
  showEmojiPicker: boolean = false;
  emojiSearchMode: boolean = false;
  emojiRegex: RegExp = /(?:\:)(.*?)(?=\:|$)/;
  emojiSearchResults: EmojiData[] = [];
  emojiMatch: string;

  constructor(
    private differs: KeyValueDiffers,
    public dialog: MatDialog,
    private emojiSearch: EmojiSearch,
    private emojiService: EmojiService,
    @Inject(taskService) private ts: any,
    @Inject(analyticsService) private analytics: any,
    @Inject(alertService) private alerts: any
  ) {
    this.differ = this.differs.find({}).create();
  }

  ngDoCheck() {
    // Check to see if the commentReplyId has changed in the taskService
    const change = this.differ.diff(this.commentReplyID);
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

  get isStaff() {
    return this.task.project().unit().my_role !== 'Student';
  }

  get originalComment() {
    if (this.task.comments != null) {
      const original = this.task.comments.find((x) => x.id === this.commentReplyID.id);
      if (original != null) {
        return original;
      }
    }
    return null;
  }

  cancelReply() {
    this.ts.currentReplyID.id = null;
  }

  contentEditableValue() {
    const UA = navigator.userAgent;
    const isWebkit = /WebKit/.test(UA) && !/Edge/.test(UA);
    return isWebkit ? 'plaintext-only' : 'true';
  }

  ngOnInit() {}

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
      } // timeout to ensure that the innerhtml is updated with the new character.
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
    this.popovers.forEach((popover: PopoverDirective) => {
      popover.hide();
    });
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
    const originalCommentID = this.originalComment ? this.originalComment.id : null;
    if (originalCommentID != null) {
      this.cancelReply();
    }
    const text = this.emojiService.nativeEmojiToColons(this.input.first.nativeElement.innerText);
    this.ts.addComment(
      this.task,
      text,
      'text',
      originalCommentID,
      (success: any) => {
        this.input.first.nativeElement.innerText = '';
        this.analytics.event('Vie Comments', 'Added new comment');
        this.ts.scrollDown();
        this.task.comments = this.ts.mapComments(this.task.comments);
      },
      (failure: any) => this.alerts.add('danger', failure.data.error, 2000)
    );
  }
}

// The discussion prompt composer fialog Component
// tslint:disable-next-line: max-classes-per-file
@Component({
  selector: 'discussion-prompt-composer-dialog.html',
  templateUrl: 'discussion-prompt-composer-dialog.html',
  styleUrls: ['./discussion-prompt-composer/discussion-prompt-composer.component.scss'],
})
export class DiscussionComposerDialog implements OnInit {
  constructor(public dialogRef: MatDialogRef<DiscussionComposerDialog>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {}
}
