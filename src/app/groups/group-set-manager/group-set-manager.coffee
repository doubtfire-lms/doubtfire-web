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
  controller: ($scope, newGroupService, gradeService, alertService) ->
    if !$scope.unitRole? && !$scope.project?
      throw Error "Group set group manager must have exactly one unit role or project"
    # Reset member panel toolbar visibility
    $scope.newGroupSelected = ->
      $scope.showMemberPanelToolbar = false if $scope.unitRole?
    $scope.groupMembersLoaded = ->
      $scope.showMemberPanelToolbar = true if $scope.unitRole?

    # Add new member to the group
    $scope.addMember = (member) ->
      $scope.selectedGroup.addMember(member)
      $scope.selectedStudent = null

    # Update name of group
    $scope.updateGroup = (data) ->
      newGroupService.update({
        unitId: $scope.unit.id,
        groupSetId: $scope.selectedGroupSet.id,
        id: $scope.selectedGroup.id,
      }, {
        entity: data
      }).subscribe({
        next: (response) ->
          alertService.add("success", "Group changed", 2000)
        error: (response) ->
          alertService.add("danger", response, 6000)
      })
)
