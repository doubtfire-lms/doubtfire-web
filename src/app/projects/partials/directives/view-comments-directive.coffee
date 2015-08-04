angular.module("doubtfire.projects.view-comments-directive", [
  'doubtfire.units.partials'
  'doubtfire.projects.partials'
])

.directive('viewComments', ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/view-comments.tpl.html'
  controller: ($scope, $modal, $state, TaskFeedback, TaskComment, Task, Project, taskService, alertService, projectService) ->
    #
    # Comment code
    #
    $scope.currentPage = 1
    $scope.pageSize = 3
    $scope.maxSize = 5

    $scope.$watch 'activeTask', (newTask) ->
      fetchTaskComments(newTask)

    #
    # Comment text area enter to submit comment
    #
    fetchTaskComments = (task) ->
      TaskComment.query {task_id: task.id},
        (response) ->
          task.comments = response
          $scope.currentPage = 1


    $scope.checkCommentTextareaEnter = (e) ->
      e = e || window.event
      # Hit return and not shift key
      if e.keyCode is 13 and not e.shiftKey
        $scope.addComment()
        return false
      return true

    $scope.addComment = () ->
      TaskComment.create { task_id: $scope.activeTask.id, comment: $scope.comment.text },
        (response) ->
          if ! $scope.activeTask.comments
            $scope.activeTask.comments = []
          $scope.activeTask.comments.unshift response
          $scope.comment.text = ""
        (error) ->
          alertService.add("danger", "Request failed, cannot add a comment at this time.", 2000)

    $scope.deleteComment = (id) ->
      TaskComment.delete { task_id: $scope.activeTask.id, id: id },
        (response) ->
          #$scope.activeTask.comments.splice response
          $scope.activeTask.comments = $scope.activeTask.comments.filter (e) -> e.id != id
        (error) ->
          alertService.add("danger", "Request failed, you cannot delete this comment.", 2000)
)