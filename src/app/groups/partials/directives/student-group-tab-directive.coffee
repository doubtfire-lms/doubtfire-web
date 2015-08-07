angular.module('doubtfire.groups.partials.student-group-tab-directive', [])

.directive('studentGroupTab', ->
  restrict: 'E'
  templateUrl: 'groups/partials/templates/student-group-tab.tpl.html'

  controller: ($scope, Group, alertService, GroupMember, projectService) ->
    $scope.selectedGroup = null

    $scope.groupForSet = (gs) ->
      if gs
        _.find $scope.project.groups, (grp) -> grp.group_set_id == gs.id

    $scope.updateGroup = (data) ->
      Group.update(
        {
          unit_id: $scope.unit.id,
          group_set_id: $scope.selectedGroupset.id,
          id: $scope.selectedGroup.id,
          group: {
            name: data
          }
        }
        (response) -> alertService.add("success", "Group name changed", 2000)
        (response) -> alertService.add("danger", response.data.error, 6000)
      )

    $scope.onSelectGroup = (grp) ->
      GroupMember.create(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          group_id: grp.id
          project_id: $scope.project.project_id
        },
        (response) ->
          projectService.updateGroups($scope.project) #change groups
          alertService.add("success", "Joined group", 2000)
          $scope.refreshGroupMembers()
        (error) ->
          alertService.add("danger", error.data.error, 6000)
          $scope.selectedGroup = null
      )

    $scope.$watch 'project', (newValue, oldValue) ->
      $scope.selectedGroup = $scope.groupForSet($scope.selectedGroupset)
      $scope.$digest #notify

    $scope.$watch 'selectedGroupset', (newValue, oldValue) ->
      $scope.selectedGroup = $scope.groupForSet(newValue)
      $scope.$digest #notify
)