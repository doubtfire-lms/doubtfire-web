angular.module('doubtfire.units.states.tasks.inbox', [])

#
# Task inbox for tasks to deal with
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/inbox', {
    parent: 'units/tasks'
    url: '/inbox/:taskId'
    templateUrl: "units/states/tasks/inbox/inbox.tpl.html"
    controller: "TaskInboxStateCtrl"
    data:
      task: "Task Inbox"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('TaskInboxStateCtrl', ($scope, Unit) ->
  $scope.taskData.source = Unit.tasksForTaskInbox
)
