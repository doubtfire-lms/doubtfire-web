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
    comment: '=ngModel'
    singleDropZone: '=?'
  controller: ($scope, $modal, $state, $sce, $timeout, CommentResourceService, CommentsModal, listenerService, currentUser, TaskFeedback, TaskComment, Task, Project, taskService, alertService, projectService, analyticsService) ->

    $scope.isRecorderOpen = false
    # Initialise comment
    $scope.comment = {
      text: ""
      type: "text"
    }

    $scope.audioPopover = 'audioRecorderPopover.html'

    # Don't insert a newline character when sending a comment
    $scope.keyPress = (e) ->
      if (e.key.toLowerCase() == "enter" && !e.shiftKey)
        e.preventDefault()
        if $scope.comment.text.trim() != ""
          $scope.addComment()

    $scope.formatImageName = (imageName) ->
      index = imageName.indexOf(".")
      nameString = imageName.substring(0,index)
      typeString = imageName.substring(index)

      if nameString.length > 20
        nameString = nameString.substring(0,20) + ".."

      finalString = nameString + typeString
      finalString

    #============================================================================
    $scope.clearEnqueuedUpload = (upload) ->
      upload.model = null
      refreshShownUploadZones()

    #============================================================================
    # Upload image files as comments to a given task
    $scope.postAttachmentComment = ->
      taskService.addMediaComment(CommentResourceService.task, $scope.upload.model[0],
        (success) ->
          taskService.scrollDown()
        (failure) ->
          alertService.add('danger', "Failed to post image. #{failure.data?.error}")
      )
      $scope.clearEnqueuedUpload($scope.upload)

    #============================================================================
    # Will refresh which shown drop zones are shown
    # Only changes if showing one drop zone
    refreshShownUploadZones = ->
      if $scope.singleDropZone
        # Find the first-most empty model in each zone
        firstEmptyZone = _.find($scope.uploadZones, (zone) -> !zone.model? || zone.model.length == 0)
        if firstEmptyZone?
          $scope.shownUploadZones = [firstEmptyZone]
        else
          $scope.shownUploadZones = []

    $scope.addComment = ->
      $scope.comment.text = $scope.comment.text.trim()
      taskService.addComment $scope.task, $scope.comment.text, "text",
        (success) ->
          $scope.comment.text = ""
          analyticsService.event "View Task Comments", "Added new comment"
          taskService.scrollDown()
        (failure) -> #changed from response to failure
          alertService.add("danger", failure.data.error, 2000)
)
