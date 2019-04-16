import { Component, OnInit, Inject, Input, ViewChildren, QueryList } from '@angular/core';
import { taskService, analyticsService, alertService, CommentResourceService } from 'src/app/ajs-upgraded-providers';
import { PopoverDirective } from 'ngx-bootstrap';

enum PopupStates { closed, audioComment, discussionComment }

@Component({
  selector: 'task-comment-composer',
  templateUrl: './task-comment-composer.html'
})
export class TaskCommentComposerComponent implements OnInit {
  @Input() task: {};
  public popupStates = PopupStates;
  public showingPopup: PopupStates = PopupStates.closed;
  comment = {
    text: '',
    type: 'text'
  };
  audioPopover: string = 'audioRecorderPopover.html';

  @ViewChildren(PopoverDirective) popovers: QueryList<PopoverDirective>;
  ngAfterViewInit() {
    this.popovers.forEach((popover: PopoverDirective) => {
      popover.onShown.subscribe(() => {
        this.popovers
          .filter(p => p !== popover)
          .forEach(p => p.hide());
      });
    });
  }

  constructor(
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

  // Don't insert a newline character when sending a comment
  send(e: Event) {
    // if ((e.key.toLowerCase() === 'enter') && !e.shiftKey) {
    // e.preventDefault();
    e.preventDefault();
    let comment = this.comment.text.trim();
    if (comment !== '') {
      this.addComment(comment);
    }
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
      (success) => {
        this.comment.text = '';
        this.analytics.event('Vie Comments', 'Added new comment');
        this.ts.scrollDown();
      },
      failure =>
        this.alerts.add('danger', failure.data.error, 2000)
    );
  }
}

