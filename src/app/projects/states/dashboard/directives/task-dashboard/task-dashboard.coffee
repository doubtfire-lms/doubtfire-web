angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard', [
  'doubtfire.projects.states.dashboard.directives.task-dashboard.directives'
])
#
# Dashboard of task-related info
#
.directive('taskDashboard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/task-dashboard.tpl.html'
  scope:
    task: '='
  controller: ($scope, Task, listenerService) ->

)
