angular.module("doubtfire.tasks.task-comment-composer", [])

#
# Allows a new comment to be created and added to a task
# Includes the ability to create and add audio, text, and image comments
#
.directive('taskCommentComposer', ->
  restrict: 'E'
  templateUrl: 'tasks/task-comment-composer/task-comment-composer.tpl.html'
  scope:
    task: '='
  controller: ($scope, $modal, $state, $sce, $timeout, CommentResourceService, CommentsModal, listenerService, currentUser, TaskFeedback, TaskComment, Task, Project, taskService, alertService, projectService, analyticsService) ->

    # Initialise comment
    $scope.comment = {
      text: ""
      type: "text"
    }

    $scope.audioPopover = 'audioRecorderPopover.html'

    # Checks for enter keydown
    $scope.enterDown = (editor) ->
      $scope.addComment()
      return CodeMirror.Pass

    #===========================================================================================
    # Submits a new comment
    $scope.addComment = ->
      $scope.comment.text = $scope.comment.text.trim()
      taskService.addComment $scope.task, $scope.comment.text, CommentResourceService.commentType,
      (success) ->
        $scope.comment.text = ""
        analyticsService.event "View Task Comments", "Added new comment"
        scrollDown()
      (failure) -> #changed from response to failure
        alertService.add("danger", response.data.error, 2000)
)
