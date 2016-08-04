mod = angular.module('doubtfire.groups.tutor-group-manager', [])

#
# Context for tutors to see and manage groups
#
.directive('tutorGroupManager', ->
  restrict: 'E'
  template: require('./tutor-group-manager.tpl.html')

  controller: ($scope) ->
)

module.exports = mod.name
