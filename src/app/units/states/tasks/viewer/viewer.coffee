angular.module('doubtfire.units.states.tasks.viewer', [
  'doubtfire.units.states.tasks.viewer.directives'
])

#
# Give feedback when on one-to-one for students (i.e., tasksRequiringFeedback)
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/viewer', {
    parent: 'units/tasks'
    url: '/viewer'
    templateUrl: "units/states/tasks/viewer/viewer.tpl.html"
    controller: "TaskViewerStateCtrl"
    data:
      task: "Task List"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('TaskViewerStateCtrl', ($scope) ->
  $scope.taskDefs = $scope.unit.taskDefinitions
  $scope.selectedTaskDef = $scope.taskDefs[0]
)
