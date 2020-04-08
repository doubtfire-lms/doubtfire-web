import { Component, OnInit, Input, Inject, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { TaskCommentService } from 'src/app/common/services/task-comment.service';
import { taskService, alertService, taskComment, Task, commentsModal } from 'src/app/ajs-upgraded-providers';

interface Comment {
  recipient: {
    name: string;
  };
  author_is_me: boolean;
  recipient_read_time: string;
  text: string;
  last_read?: boolean;
}

@Component({
  selector: 'task-comments-viewer',
  templateUrl: './task-comments-viewer.component.html',
  styleUrls: ['./task-comments-viewer.component.scss']
})
export class TaskCommentsViewerComponent implements OnChanges, OnInit {
  lastComment: Comment = { recipient: { name: '' }, author_is_me: false, recipient_read_time: '', text: '' };
  project: any = {};
  loading: boolean = true;

  @Input() comment?: Comment = ({ recipient: { name: '' }, author_is_me: false, recipient_read_time: '', text: '' });
  @Input() task: any = { comments: [] };
  @Input() refocusOnTaskChange: boolean;

  constructor(
    private taskCommentService: TaskCommentService,
    @Inject(taskService) private ts: any,
    @Inject(commentsModal) private commentsModal: any,
    @Inject(Task) private Task: any,
    @Inject(alertService) private alerts: any,
    @Inject(taskComment) private TaskComment: any,
  ) {

  }
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.loading = true;

    // Must have project for task to be mapped
    if (changes.task.currentValue?.project != null) {
      this.project = changes.task.currentValue.project();
      this.TaskComment.query({
        project_id: this.project.project_id,
        task_definition_id: this.task.task_definition_id
      }, (response: any) => {
        this.task.comments = this.ts.mapComments(response);
        let lastReadComment = this.task.comments.slice().reverse().find(
          comment => comment.recipient_read_time != null || !comment.author_is_me
        );
        if (lastReadComment) { lastReadComment.last_read = true; }
        this.task.num_new_comments = 0;
        this.ts.scrollDown();
        this.loading = false;
      });

      this.taskCommentService.setTask(this.task);
    } else {
      this.loading = false;
    }
  }

  shouldShowReadReceipt() {
    return (this.task.comments.slice(-1)[0]?.author_is_me);
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
