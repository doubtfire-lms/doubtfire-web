angular.module('doubtfire.units.states.tasks.viewer', [
  'doubtfire.units.states.tasks.viewer.directives'
])

#
# Give feedback when on one-to-one for students (i.e., tasksRequiringFeedback)
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/viewer', {
    parent: 'units/tasks'
    url: '/viewer/{taskKey:any}'
    # We can recycle the task inbox, switching the data source scope variable
    templateUrl: "units/states/tasks/viewer/viewer.tpl.html"
    controller: "TaskViewerStateCtrl"
    data:
      task: "View Task Sheets"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('TaskViewerStateCtrl', ($scope, Unit) ->
  $scope.taskSheetData.source = Unit.task_definitions
)
