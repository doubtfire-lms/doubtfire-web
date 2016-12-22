angular.module('doubtfire.units.states.task-inbox', [
  # 'doubtfire.units.states.task-inbox.task-commenter'
  # 'doubtfire.units.states.task-inbox.task-submission'
])

#
# Teacher child state for units
#
.config(($stateProvider) ->
  $stateProvider.state 'units#tasks', {
    parent: 'units#index'
    url: '/tasks/:taskId'
    views:
      unitIndex:
        templateUrl: "units/states/task-inbox/task-inbox.tpl.html"
        controller: "UnitTaskInboxFeedback"
    data:
      task: "Task Inbox"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('UnitTaskInboxFeedback', ($scope) ->

)
