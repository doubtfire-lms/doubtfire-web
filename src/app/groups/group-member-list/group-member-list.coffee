angular.module('doubtfire.groups.group-member-list', [])

#
# Lists members in a group
#
.directive('groupMemberList', ->
  restrict: 'E'
  templateUrl: 'groups/group-member-list/group-member-list.tpl.html'

  controller: ($scope, GroupMember, gradeService) ->
    $scope.memberSortOrder = 'student_name'
    $scope.members = []

    $scope.$watch "selectedGroupset", (newValue, oldValue) ->
      if newValue && $scope.selectedGroup && $scope.selectedGroupset
        if $scope.selectedGroupset.id != $scope.selectedGroup.group_set_id
          $scope.members = []
          $scope.selectedGroup = null
        else
          $scope.refreshGroupMembers()

    $scope.refreshGroupMembers = ->
      if $scope.selectedGroup && $scope.selectedGroupset
        if $scope.selectedGroupset.id == $scope.selectedGroup.group_set_id
          GroupMember.query { unit_id: $scope.unit.id, group_set_id: $scope.selectedGroupset.id, group_id: $scope.selectedGroup.id }, (members) ->
            $scope.members = members
        else
          $scope.members = []
          $scope.selectedGroup = null
      else
        $scope.members = []

    $scope.$watch "selectedGroup", (newValue, oldValue) ->
      if newValue != oldValue
        $scope.refreshGroupMembers()
)
