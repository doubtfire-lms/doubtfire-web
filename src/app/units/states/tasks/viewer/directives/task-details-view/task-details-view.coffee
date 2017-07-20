angular.module('doubtfire.units.states.tasks.viewer.directives.task-details-view', [
  'doubtfire.units.states.tasks.viewer.directives.task-details-view.directives'
])
#
# Dashboard of task-related info
#
.directive('taskDetailsView', ->
  restrict: 'E'
  templateUrl: 'units/states/tasks/viewer/directives/task-details-view/task-details-view.tpl.html'
  scope:
    task: '='
    unit: '='
  controller: ($scope, Task, listenerService) ->

)
