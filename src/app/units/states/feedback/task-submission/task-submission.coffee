angular.module('doubtfire.units.states.feedback.task-submission', [])
#
# View a student's submission of a task
#
.directive('taskSubmission', ->
  restrict: 'E'
  templateUrl: 'units/states/feedback/task-submission/task-submission.tpl.html'
  scope:
    task: '='
  controller: ($scope) ->
)
