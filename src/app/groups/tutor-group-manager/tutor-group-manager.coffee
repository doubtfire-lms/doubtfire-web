angular.module('doubtfire.groups.tutor-group-manager', [])

#
# Context for tutors to see and manage groups
#
.directive('tutorGroupManager', ->
  restrict: 'E'
  templateUrl: 'groups/tutor-group-manager/tutor-group-manager.tpl.html'

  controller: ($scope) ->
)
