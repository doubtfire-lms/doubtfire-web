angular.module('doubtfire.tasks.partials.provide-task-feedback',[])

.directive('provideTaskFeedback', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/provide-task-feedback.tpl.html'
  scope:
    task: "=task"
    unit: "=unit"
    assessingUnitRole: "=assessingUnitRole"
    unitRole: "=unitRole"
    fullscreen: "=fullscreen"
  controller: ($scope) ->
    $scope.search = ""
)