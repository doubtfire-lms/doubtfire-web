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
    title: "Task Inbox"
    url: '/tasks/:taskId'
    views:
      unitIndex:
        templateUrl: "units/states/task-inbox/task-inbox.tpl.html"
        controller: "UnitTaskInboxFeedback"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('UnitTaskInboxFeedback', ($scope) ->

)
