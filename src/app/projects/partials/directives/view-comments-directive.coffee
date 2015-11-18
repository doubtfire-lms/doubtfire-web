angular.module("doubtfire.projects.view-comments-directive", [
  'doubtfire.units.partials'
  'doubtfire.projects.partials'
])

.directive('viewComments', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/view-comments.tpl.html'
  scope:
    project: "=project"
    task: "=task"
  controller: ($scope, $modal, $state, TaskFeedback, TaskComment, Task, Project, taskService, alertService, projectService) ->
    #
    # Comment code
    #
    $scope.currentPage = 1
    $scope.pageSize = 3
    $scope.maxSize = 5

    $scope.$watch 'task', (newTask) ->
      fetchTaskComments(newTask)

    #
    # Comment text area enter to submit comment
    #
    fetchTaskComments = (task) ->
      TaskComment.query {task_id: task.id},
        (response) ->
          task.comments = response
          $scope.currentPage = 1

    $scope.addComment = () ->
      TaskComment.create { task_id: $scope.task.id, comment: $scope.comment.text },
        (response) ->
          if ! $scope.task.comments
            $scope.task.comments = []
          $scope.task.comments.unshift response
          $scope.comment.text = ""
        (response) ->
          alertService.add("danger", response.data.error, 2000)

    $scope.deleteComment = (id) ->
      TaskComment.delete { task_id: $scope.task.id, id: id },
        (response) ->
          $scope.task.comments = $scope.task.comments.filter (e) -> e.id != id
        (response) ->
          alertService.add("danger", response.data.error, 2000)
)