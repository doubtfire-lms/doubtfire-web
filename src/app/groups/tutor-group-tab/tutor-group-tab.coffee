angular.module('doubtfire.groups.tutor-group-tab', [])

#
# Context for tutors to see and manage groups
#
.directive('tutorGroupTab', ->
  restrict: 'E'
  templateUrl: 'groups/tutor-group-tab/tutor-group-tab.tpl.html'

  controller: ($scope) ->
)
