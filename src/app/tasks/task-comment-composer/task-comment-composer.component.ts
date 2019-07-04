import { Component, OnInit, Inject, Input, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { taskService, analyticsService, alertService, CommentResourceService } from 'src/app/ajs-upgraded-providers';
import { PopoverDirective } from 'ngx-bootstrap';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'task-comment-composer',
  templateUrl: './task-comment-composer.html',
})
export class TaskCommentComposerComponent implements OnInit {
  @Input() task: {};
  comment = {
    text: '',
    type: 'text'
  };
  audioPopover: string = 'audioRecorderPopover.html';

  @ViewChildren(PopoverDirective) popovers: QueryList<PopoverDirective>;

  constructor(
    public dialog: MatDialog,
    @Inject(taskService) private ts: any,
    @Inject(analyticsService) private analytics: any,
    @Inject(alertService) private alerts: any,
    @Inject(CommentResourceService) private commentResourceService: any,
  ) { }

  ngOnInit() {
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

  send(e: Event) {
    e.preventDefault();
    let comment = this.comment.text.trim();
    if (comment !== '') {
      this.addComment(comment);
    }
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
      disableClose: true
    });

    dialogRef.afterOpened().subscribe((result: any) => {
    });

    dialogRef.afterClosed().subscribe((result: any) => {
    });
  }

  // clearEnqueuedUpload(upload) {
  //   upload.model = null;
  //   return this.refreshShownUploadZones();
  // }

  // Upload image files as comments to a given task
  // postAttachmentComment() {
  //   this.ts.addMediaComment(this.commentResourceService.task, $scope.upload.model[0],
  //     success => this.ts.scrollDown(),
  //     failure => this.alerts.add('danger', `Failed to post image. ${(failure.data != null ? failure.data.error : undefined)}`));
  //   return $scope.clearEnqueuedUpload($scope.upload);
  // }

  // Will refresh which shown drop zones are shown
  // Only changes if showing one drop zone
  // private refreshShownUploadZones() {
  //   if (this.singleDropZone) {
  //     // Find the first-most empty model in each zone
  //     const firstEmptyZone = _.find($scope.uploadZones, zone => (zone.model == null) || (zone.model.length === 0));
  //     if (firstEmptyZone != null) {
  //       return $scope.shownUploadZones = [firstEmptyZone];
  //     } else {
  //       return $scope.shownUploadZones = [];
  //     }
  //   }
  // };

  addComment(comment: string) {
    this.ts.addComment(this.task, comment, 'text',
      (success: any) => {
        this.comment.text = '';
        this.analytics.event('Vie Comments', 'Added new comment');
        this.ts.scrollDown();
      },
      (failure: any) =>
        this.alerts.add('danger', failure.data.error, 2000)
    );
  }
}


// The discussion prompt composer fialog Component
@Component({
  selector: 'discussion-prompt-composer-dialog.html',
  templateUrl: 'discussion-prompt-composer-dialog.html',
  styleUrls: ['./discussion-prompt-composer/discussion-prompt-composer.component.scss'],
})
export class DiscussionComposerDialog implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DiscussionComposerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }
}
