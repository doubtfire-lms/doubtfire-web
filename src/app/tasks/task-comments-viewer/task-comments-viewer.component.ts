import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { TaskCommentService } from 'src/app/common/services/task-comment.service';
import { taskService, alertService, taskComment, Task, commentsModal } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'task-comments-viewer',
  templateUrl: './task-comments-viewer.component.html',
  styleUrls: ['./task-comments-viewer.component.scss']
})
export class TaskCommentsViewerComponent implements OnChanges {
  @Input() comment: any;
  @Input() task: any = { comments: [] };
  @Input() refocusOnTaskChange: boolean;

  lastComment: any = {};
  project: any = {};


  constructor(
    private taskCommentService: TaskCommentService,
    @Inject(taskService) private ts: any,
    @Inject(commentsModal) private commentsModal: any,
    @Inject(Task) private Task: any,
    @Inject(alertService) private alerts: any,
    @Inject(taskComment) private TaskComment: any,
  ) {
    if (typeof this.comment?.text !== 'string') {
      this.comment = { text: '' };
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);

    if (!changes.task.isFirstChange()) {
      if (changes.task.currentValue?.project !== 'undefined') {
        // Must have project for task to be mapped
        this.project = changes.task.currentValue.project();
        //  Once project is loaded fetch task comments
        this.TaskComment.query({
          project_id: this.project.project_id,
          task_definition_id: this.task.task_definition_id
        }, (response: any) => {
          let comments = this.ts.mapComments(response);
          this.task.comments = comments; // in the HTML, the mapped task.comments are displayed
          this.lastComment = this.task.comments.slice(-1)[0];
          this.task.num_new_comments = 0;
          this.ts.scrollDown();
          if (this.refocusOnTaskChange) {
          }
        });

        this.taskCommentService.setTask(this.task);
      }
    }
  }

  uploadFiles(event) {
    [...event].forEach(file => {
      if (['image/png', 'image/pdf'].includes(file.type)) {
        this.postAttachmentComment(file);
      }
    });
    this.task.comments = this.ts.mapComments(this.task.comments);
  }

  // # Upload image files as comments to a given task
  postAttachmentComment(file) {
    this.ts.addMediaComment(this.taskCommentService.task, file,
      (success) => this.ts.scrollDown(),
      (failure) => this.alerts.add('danger', 'Failed to post image. #{failure.data?.error}')
    );
  }

  scrollToComment(commentID) {
    document.querySelector(`#comment-${commentID}`).scrollIntoView();
  }

  openCommentsModal(comment) {
    let resourceUrl = this.Task.generateCommentsAttachmentUrl(this.project, this.task, comment);
    this.commentsModal.show(resourceUrl, comment.type);
  }

  isBubbleComment(commentType: string) {
    return this.ts.isBubbleComment(commentType);
  }

  shouldShowAuthorIcon(commentType: string) {
    return !(commentType === 'extension' || commentType === 'status');
  }

  getCommentAttachment(comment) {
    return this.Task.generateCommentsAttachmentUrl(this.project, this.task, comment);
  }

  commentClasses(comment: any): object {
    return {
      [`${comment.type}-bubble`]: true,
      'first-in-series': comment.should_show_timestamp || comment.first_in_series,
      'last-in-series': comment.should_show_avatar
    };
  }

  //     $overlay = angular.element(document.querySelector('#contextOverlay'))

}
// angular.module('doubtfire.tasks.task-comments-viewer", [])

// #
// # View's the comments for a specific task, and allows new
// # comments to be made on a task
// #
// .directive('taskCommentsViewer', ->
//   restrict: 'E'
//   templateUrl: 'tasks/task-comments-viewer/task-comments-viewer.tpl.html'
//   scope:
//     task: '='
//     singleDropZone: '=?'
//     comment: '=?'
//     autofocus: '@?'
//     refocusOnTaskChange: '@?'

//   controller: ($scope, $modal, $state, $sce, $timeout, $location, $anchorScroll, markdown, TaskCommentService, CommentsModal, listenerService, currentUser, TaskComment, taskService, alertService, analyticsService, Task) ->
//     listeners = listenerService.listenTo($scope)
//     markdown.setFlavor('github')

//
//


//     # Watch for initial task
//     listeners.push $scope.$watch 'task', (newTask) ->
//       return unless newTask?.project? # Must have project for task to be mapped
//       $scope.project = newTask.project()
//       # Once project is loaded fetch task comments
//       TaskComment.query {
//         project_id: $scope.project.project_id,
//         task_definition_id: $scope.task.task_definition_id
//       }, (response) ->
//         comments = taskService.mapComments(response)
//         $scope.task.comments = comments #in the HTML, the mapped task.comments are displayed
//         $scope.lastComment = $scope.task.comments.slice(-1)[0]
//         $scope.task.num_new_comments = 0
//         taskService.scrollDown()
//         $scope.focus?() if $scope.refocusOnTaskChange

//         TaskCommentService.setTask($scope.task)

//     $scope.scrollToComment = (commentID) ->
//       $anchorScroll("comment-#{commentID}")

//     $scope.openCommentsModal = (comment) ->
//       resourceUrl = $sce.trustAsResourceUrl(Task.generateCommentsAttachmentUrl($scope.project, $scope.task, comment))
//       CommentsModal.show(resourceUrl, comment.type)

//     $scope.isBubbleComment = (commentType) ->
//       return taskService.isBubbleComment(commentType)

//     $scope.shouldShowAuthorIcon = (commentType) ->
//       return not (commentType == "extension" || commentType == "status")

//     $scope.getCommentAttachment = (comment) ->
//       # TODO: Refactor to use other Task method
//       mediaURL = $sce.trustAsResourceUrl(Task.generateCommentsAttachmentUrl($scope.project, $scope.task, comment))

//     $overlay = angular.element(document.querySelector('#contextOverlay'))
// )
