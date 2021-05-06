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
    project: '='
    selectedGroupSet: '='
    showGroupSetSelector: '=?'
  controller: ($scope, GroupSet, Group, GroupMember, gradeService, alertService, projectService) ->
    if !$scope.unitRole? && !$scope.project?
      throw Error "Group set group manager must have exactly one unit role or project"
    # Reset member panel toolbar visibility
    $scope.newGroupSelected = ->
      $scope.showMemberPanelToolbar = false if $scope.unitRole?
    $scope.groupMembersLoaded = ->
      $scope.showMemberPanelToolbar = true if $scope.unitRole?
    resetAddMemberForm = ->
      @addMemberForm.reset()
      @addMemberForm.querySelector('input[type="search"]').focus()
    # Add new member to the group
    $scope.addMember = (member) ->
      $scope.selectedGroup.addMember(member, resetAddMemberForm)
    # Update name of group

    $scope.updateGroup = (data) ->
      Group.update(
        {
          unit_id: $scope.unit.id,
          group_set_id: $scope.selectedGroupSet.id,
          id: $scope.selectedGroup.id,
          group: {
            name: data
          }
        }
        (response) -> alertService.add("success", "Group name changed", 2000)
        (response) -> alertService.add("danger", response.data.error, 6000)
      )
)
