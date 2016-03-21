angular.module("doubtfire.tasks.task-comments-viewer", [])

#
# View's the comments for a specific task, and allows new
# comments to be made on a task
#
.directive('taskCommentsViewer', ->
  restrict: 'E'
  templateUrl: 'tasks/task-comments-viewer/task-comments-viewer.tpl.html'
  scope:
    project: "="
    task: "="
    comment: "=?"
  controller: ($scope, $modal, $state, TaskFeedback, TaskComment, Task, Project, taskService, alertService, projectService, analyticsService) ->
    #
    # Comment code
    #
    $scope.currentPage = 1
    $scope.pageSize = 3
    $scope.maxSize = 5

    # Initialise scope comment text
    unless _.isString $scope.comment?.text
      $scope.comment = { text: "" }

    $scope.$watch 'task', (newTask) ->
      fetchTaskComments(newTask)

    #
    # Comment text area enter to submit comment
    #
    fetchTaskComments = (task) ->
      TaskComment.query {project_id: $scope.project.project_id, task_definition_id: task.task_definition_id},
        (response) ->
          task.comments = response
          $scope.currentPage = 1

    $scope.checkForEnterPress = ($event) ->
      ENTER_KEY = 13
      return if $event.which isnt ENTER_KEY or $event.shiftKey
      if $scope.comment.text.trim().length isnt 0
        $scope.addComment()
      false

    $scope.addComment = () ->
<<<<<<< Updated upstream
      TaskComment.create { project_id: $scope.project.project_id, task_definition_id: $scope.task.task_definition_id, comment: $scope.comment.text },
        (response) ->
          if ! $scope.task.comments
            $scope.task.comments = []
          $scope.task.comments.unshift response
=======
      taskService.addComment task, $scope.comment.text,
        (success) ->
>>>>>>> Stashed changes
          $scope.comment.text = ""
          analyticsService.event "View Task Comments", "Added new comment"
        (response) ->
          alertService.add("danger", response.data.error, 2000)

    $scope.deleteComment = (id) ->
      TaskComment.delete { project_id: $scope.project.project_id, task_definition_id: $scope.task.task_definition_id, id: id },
        (response) ->
          $scope.task.comments = $scope.task.comments.filter (e) -> e.id isnt id
          analyticsService.event "View Task Comments", "Deleted existing comment"
        (response) ->
          alertService.add("danger", response.data.error, 2000)
)
