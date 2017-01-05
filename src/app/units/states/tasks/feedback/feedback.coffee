angular.module('doubtfire.units.states.tasks.feedback', [])

#
# Feedback for students
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/feedback', {
    parent: 'units/tasks'
    url: '/feedback/:taskId'
    # We can recycle the task inbox, switching the data source scope variable
    templateUrl: "units/states/tasks/inbox/inbox.tpl.html"
    controller: "TaskFeedbackStateCtrl"
    data:
      task: "Give Student Feedback"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('TaskFeedbackStateCtrl', ($scope, Unit) ->
  $scope.taskSource = Unit.tasksRequiringFeedback
)
