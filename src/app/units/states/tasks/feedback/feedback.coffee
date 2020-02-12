angular.module('doubtfire.units.states.tasks.feedback', [
  'doubtfire.units.states.tasks.inbox.directives'
])

#
# Give feedback when on one-to-one for students (i.e., tasksRequiringFeedback)
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/feedback', {
    parent: 'units/tasks'
    url: '/feedback/{taskKey:any}'
    # We can recycle the task inbox, switching the data source scope variable
    templateUrl: "units/states/tasks/inbox/inbox.tpl.html"
    controller: "TaskFeedbackStateCtrl"
    params:
      taskKey: dynamic: true
    data:
      task: "Give Student Feedback"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('TaskFeedbackStateCtrl', ($scope, Unit) ->
  $scope.taskData.source = Unit.tasksRequiringFeedback
)
