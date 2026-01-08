angular.module('doubtfire.units.states.tasks.moderation', [
])

#
# Get tasks for mentor moderation
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/moderation', {
    parent: 'units/tasks'
    url: '/moderation/{taskKey:any}'
    # We can recycle the task inbox, switching the data source scope variable
    templateUrl: "units/states/tasks/inbox/inbox.tpl.html"
    controller: "TaskModerationStateCtrl"
    params:
      taskKey: dynamic: true
    data:
      task: "Task Moderation"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor']
   }
)

.controller('TaskModerationStateCtrl', ($scope, newTaskService) ->
  $scope.taskData.source = newTaskService.queryTasksForMentorModeration.bind(newTaskService)

  $scope.taskData.taskDefMode = false
  $scope.showSearchOptions = false
  $scope.filters = {
    tutorialIdSelected: 'all'
  }
)
