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
    showGroupSetSelector: '=?'
  controller: ($scope, GroupSet, Group, GroupMember, gradeService, alertService, projectService) ->
    if !$scope.unitRole?
      throw Error "Group set group manager must have exactly one unit role"
    # Reset member panel toolbar visibility
    $scope.newGroupSelected = -> $scope.showMemberPanelToolbar = false
    $scope.groupMembersLoaded = -> $scope.showMemberPanelToolbar = true
    resetAddMemberForm = ->
      @addMemberForm.reset()
      @addMemberForm.querySelector('input[type="text"]').focus()
    # Add new member to the group
    $scope.addMember = (member) ->
      $scope.selectedGroup.addMember(member, resetAddMemberForm)
)
