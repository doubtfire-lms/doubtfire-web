import { Component, OnInit, Inject } from '@angular/core';
import { taskService, analyticsService, Task, alertService, CommentResourceService } from 'src/app/ajs-upgraded-providers';


@Component({
  selector: 'task-comment-composer',
  template: '<h1>test</h1>'
  // templateUrl: './task-comment-composer.html'
  // styleUrls: ['./task-comment-composer.scss']
})

export class TaskCommentComposerComponent implements OnInit {
  isRecorderOpen: boolean = false;
  comment = {
    text: '',
    type: 'text'
  };
  audioPopover: string = 'audioRecorderPopover.html';

  constructor(
    @Inject(taskService) private ts: any,
    @Inject(analyticsService) private analytics: any,
    @Inject(Task) private task: any,
    @Inject(alertService) private alerts: any,
    @Inject(CommentResourceService) private commentResourceService: any
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
  keyPress(e: any) {
    if ((e.key.toLowerCase() === 'enter') && !e.shiftKey) {
      e.preventDefault();
      if (this.comment.text.trim() !== '') {
        return this.addComment();
      }
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

  addComment() {
    this.comment.text = this.comment.text.trim();
    return this.ts.addComment(this.task, this.comment.text, 'text',
      function (success) {
        this.comment.text = '';
        this.analytics.event('Vie Comments', 'Added new comment');
        return this.ts.scrollDown();
      },
      failure =>
        this.alerts.add('danger', failure.data.error, 2000)
    );
  }
}

