angular.module('doubtfire.units.states.feedback.task-commenter', [])
#
# Makes comments on tasks
#
.directive('taskCommenter', ->
  restrict: 'E'
  templateUrl: 'units/states/feedback/task-commenter/task-commenter.tpl.html'
  scope:
    task: '='
  controller: ($scope) ->
)
