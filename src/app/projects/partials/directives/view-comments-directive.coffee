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
  controller: ($scope, $modal, $state, TaskFeedback, TaskComment, Task, Project, taskService, alertService, projectService, analyticsService) ->
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
      TaskComment.query {project_id: $scope.project.project_id, task_definition_id: task.task_definition_id},
        (response) ->
          task.comments = response
          $scope.currentPage = 1

    $scope.addComment = () ->
      TaskComment.create { project_id: $scope.project.project_id, task_definition_id: $scope.task.task_definition_id, comment: $scope.comment.text },
        (response) ->
          if ! $scope.task.comments
            $scope.task.comments = []
          $scope.task.comments.unshift response
          $scope.comment.text = ""
          analyticsService.event "View Task Comments", "Add new comment"
        (response) ->
          alertService.add("danger", response.data.error, 2000)

    $scope.deleteComment = (id) ->
      TaskComment.delete { project_id: $scope.project.project_id, task_definition_id: $scope.task.task_definition_id, id: id },
        (response) ->
          $scope.task.comments = $scope.task.comments.filter (e) -> e.id != id
          analyticsService.event "View Task Comments", "Delete existing comment"
        (response) ->
          alertService.add("danger", response.data.error, 2000)
)
