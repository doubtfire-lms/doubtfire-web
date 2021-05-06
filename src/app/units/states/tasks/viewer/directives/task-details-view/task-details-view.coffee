angular.module('doubtfire.units.states.tasks.viewer.directives.task-details-view', [])
#
# Dashboard of task-related info
#
.directive('taskDetailsView', ->
  restrict: 'E'
  templateUrl: 'units/states/tasks/viewer/directives/task-details-view/task-details-view.tpl.html'
  scope:
    taskDef: '='
    unit: '='
  controller: ($scope, Task, listenerService) ->

)
