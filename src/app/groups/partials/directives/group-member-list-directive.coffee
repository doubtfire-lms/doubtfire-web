angular.module('doubtfire.groups.partials.group-member-list-directive', [])

.directive('groupMemberList', ->
  replace: true
  restrict: 'E'
  templateUrl: 'groups/partials/templates/group-member-list.tpl.html'

  controller: ($scope, GroupMember, gradeService) ->
    $scope.memberSortOrder = 'student_name'
    $scope.members = []

    $scope.gradeFor = (member) ->
      gradeService.grades[member.target_grade]

    $scope.$watch "selectedGroup", (newValue, oldValue) ->
      if newValue && $scope.selectedGroupset
        GroupMember.query { unit_id: $scope.unit.id, group_set_id: $scope.selectedGroupset.id, group_id: newValue.id }, (members) ->
          $scope.members = members
      else
        $scope.members = []


)