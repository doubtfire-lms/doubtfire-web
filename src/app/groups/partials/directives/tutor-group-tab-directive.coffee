angular.module('doubtfire.groups.partials.tutor-group-tab', [])

.directive('tutorGroupTab', ->
  replace: true
  restrict: 'E'
  templateUrl: 'groups/partials/templates/tutor-group-tab.tpl.html'

  controller: ($scope) ->
    $scope.message = "Hello World"
)