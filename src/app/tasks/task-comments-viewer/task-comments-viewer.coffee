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
  controller: ($scope, $modal, $state, $timeout, listenerService, currentUser, TaskFeedback, TaskComment, Task, Project, taskService, alertService, projectService, analyticsService) ->
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
        $scope.task.comments = _.map(response, taskService.mapComment)
        $scope.task.num_new_comments = 0
        scrollDown()
        $scope.focus?() if $scope.refocusOnTaskChange

    # Automatically scroll the inner div to the bottom of comments
    scrollDown = ->
      $timeout ->
        objDiv = document.querySelector("task-comments-viewer .panel-body")
        wrappedResult = angular.element(objDiv)
        wrappedResult[0].scrollTop = wrappedResult[0].scrollHeight

    # Checks for enter keydown
    $scope.enterDown = (editor) ->
      $scope.addComment()
      return CodeMirror.Pass

    # Submits a new comment
    $scope.addComment = ->
      $scope.comment.text = $scope.comment.text.trim()
      taskService.addComment $scope.task, $scope.comment.text,
        (success) ->
          $scope.comment.text = ""
          analyticsService.event "View Task Comments", "Added new comment"
          scrollDown()
        (response) ->
          alertService.add("danger", response.data.error, 2000)

    # Deletes existing comment
    $scope.deleteComment = (id) ->
      TaskComment.delete { project_id: $scope.project.project_id, task_definition_id: $scope.task.task_definition_id, id: id },
        (response) ->
          $scope.task.comments = $scope.task.comments.filter (e) -> e.id isnt id
          analyticsService.event "View Task Comments", "Deleted existing comment"
        (response) ->
          alertService.add("danger", response.data.error, 2000)
)
