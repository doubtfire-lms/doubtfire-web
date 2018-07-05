angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-due-card', [])
#
# Shows overdue or due soon if the card is due
#
.directive('taskDueCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-due-card/task-due-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, alertService) ->
    $scope.applyForExtension = () ->
      $scope.task.applyForExtension(
        (success) ->
          alertService.add("success", "Extension granted", 2000)
        (failure) ->
          alertService.add("danger", "Extension failed - #{failure.data.error}", 6000)
      )
)
