angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-due-card', [])
#
# Shows overdue or due soon if the card is due
#
.directive('taskDueCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-due-card/task-due-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, alertService, ExtensionModal) ->
)
