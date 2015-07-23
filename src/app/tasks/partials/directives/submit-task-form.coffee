angular.module('doubtfire.tasks.partials.submit-task-form', [])

#
# Task uploader form
#
.directive('submitTaskForm', ->
  restrict: 'E'
  scope:
    task: '='
    project: '='
  templateUrl: 'tasks/partials/templates/submit-task-form.tpl.html'
  controller: ($scope, Task, taskService) ->

    $scope.currentState = 'select-status'

    #
    # More option booleans
    #
    $scope.allowReupload =
      $scope.task.status in ['discuss', 'fix_and_include', 'complete']

    #
    # TODO: I think re-create PDF should be deprecated, or moved elsewhere?
    #
    $scope.recreateTask = () ->
      # No callback
      taskService.recreatePDF $scope.task, null
    $scope.allowRegeneratePdf = ($scope.task.status == 'ready_to_mark' or $scope.task.status == 'discuss' or $scope.task.status == 'complete') and $scope.task.has_pdf
  )