angular.module("doubtfire.tasks.task-comments-viewer", [])

#
# View's the comments for a specific task, and allows new
# comments to be made on a task
#
.directive('taskCommentsViewer', ->
  restrict: 'E'
  templateUrl: 'tasks/task-comments-viewer/task-comments-viewer.tpl.html'
  scope:
    task: '='
    comment: '=?'
    autofocus: '@?'
    refocusOnTaskChange: '@?'

  controller: ($scope, $modal, $state, $sce, $timeout, CommentResourceService, CommentsModal, listenerService, currentUser, TaskFeedback, TaskComment, Task, Project, taskService, alertService, projectService, analyticsService) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)

    # Initialise scope comment text
    unless _.isString $scope.comment?.text
      $scope.comment = { text: "" }

    # Watch for initial task
    listeners.push $scope.$watch 'task', (newTask) ->
      return unless newTask?.project? # Must have project for task to be mapped
      $scope.project = newTask.project()
      # Once project is loaded fetch task comments
      TaskComment.query {
        project_id: $scope.project.project_id,
        task_definition_id: $scope.task.task_definition_id
      }, (response) ->
        $scope.task.comments = _.map(response, taskService.mapComment) #in the HTML, the mapped task.comments are displayed
        $scope.lastComment = $scope.task.comments.slice(-1)[0]
        $scope.task.num_new_comments = 0
        taskService.scrollDown()
        $scope.focus?() if $scope.refocusOnTaskChange

        CommentResourceService.setTask($scope.task)


    $scope.openCommentsModal = (comment)->
      resourceUrl = $sce.trustAsResourceUrl(Task.generateCommentsAttachmentUrl($scope.project, $scope.task, comment))
      CommentResourceService.setResourceUrl(resourceUrl)
      CommentResourceService.setCommentType(comment.type)
      CommentsModal.show()

    #===========================================================================================
    $scope.canUserEdit = (comment) ->
      canEdit = false
      if comment.author_is_me || currentUser.role == "Admin"
        canEdit = true
      canEdit

    #===========================================================================================
    $scope.getCommentAttachment = (comment) ->
      # TODO: Refactor to use other Task method
      mediaURL = $sce.trustAsResourceUrl(Task.generateCommentsAttachmentUrl($scope.project, $scope.task, comment))

    $scope.deleteComment = (id) ->
      TaskComment.delete { project_id: $scope.project.project_id, task_definition_id: $scope.task.task_definition_id, id: id },
        (response) ->
          $scope.task.comments = $scope.task.comments.filter (e) -> e.id isnt id
          analyticsService.event "View Task Comments", "Deleted existing comment"
        (response) ->
          alertService.add("danger", response.data.error, 2000)
)
