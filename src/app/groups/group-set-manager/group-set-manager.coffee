angular.module('doubtfire.groups.group-set-manager', [])

#
# Manager directive for tutors to add and remove group
# members from a group within a group set context
#
.directive('groupSetManager', ->
  restrict: 'E'
  templateUrl: 'groups/group-set-manager/group-set-manager.tpl.html'
  scope:
    unit: '='
    unitRole: '='
    selectedGroupSet: '='
  controller: ($scope, GroupSet, Group, GroupMember, gradeService, alertService, projectService) ->
    if !$scope.unitRole?
      throw Error "Group set group manager must have exactly one unit role"
)
