angular.module('doubtfire.groups.group-member-list', [])

#
# Lists members in a group
#
.directive('groupMemberList', ->
  restrict: 'E'
  templateUrl: 'groups/group-member-list/group-member-list.tpl.html'
  scope:
    unit: '='
    project: '='
    unitRole: '='
    selectedGroup: '='
    onMembersLoaded: '=?'
  controller: ($scope, $timeout, GroupMember, gradeService, listenerService) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)

    # Initial sort orders
    $scope.tableSort =
      order: 'student_name'
      reverse: false

    # Table sorting
    $scope.sortTableBy = (header) ->
      $scope.tableSort.order = header
      $scope.tableSort.reverse = !$scope.tableSort.reverse

    # Loading
    startLoading  = -> $scope.loaded = false
    finishLoading = -> $timeout(->
      $scope.loaded = true
      $scope.onMembersLoaded?()
    , 500)

    # Initially not loaded
    $scope.loaded = false

    # Remove group members
    $scope.removeMember = (member) ->
      $scope.selectedGroup.removeMember(member)

    # Listen for changes to group
    listeners.push $scope.$watch "selectedGroup.id", (newGroupId) ->
      return unless newGroupId?
      startLoading()
      $scope.canRemoveMembers = $scope.unitRole || $scope.selectedGroup.groupSet().allow_students_to_manage_groups
      $scope.selectedGroup.getMembers((members) ->
        finishLoading()
      )
)
