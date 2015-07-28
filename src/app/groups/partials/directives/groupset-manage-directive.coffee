angular.module('doubtfire.groups.partials.groupset-manage-directive', [])

.directive('groupsetManage', ->
  restrict: 'E'
  templateUrl: 'groups/partials/templates/groupset-manage-view.tpl.html'
  # scope:
  #   assessingUnitRole: "="
  #   unit: "="
  #   selectedGroupset: "="

  controller: ($scope, Group, GroupMember, gradeService, alertService) ->
    $scope.staffFilter = 'mine'

    $scope.toggleStaffFilter = () ->
      if $scope.staffFilter == 'mine'
        $scope.staffFilter = 'all'
      else
        $scope.staffFilter = 'mine'

    $scope.saveGroup = (data, id) ->
      Group.update(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          id: id,
          group: {
            name: data.name,
            tutorial_id: data.tutorial_id,
          }
        }, (response) ->
        (response) -> alertService.add("danger", response.data.error, 6000)
      )

    $scope.removeGroup = (grp) ->
      Group.delete(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          id: grp.id
        }, (response) -> $scope.groups = _.filter($scope.groups, (grp1) -> grp.id != grp1.id ) )

    $scope.removeGroupMember = (member) ->
      GroupMember.delete(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          group_id: $scope.selectedGroup.id
          id: member.project_id
        }
        (response) -> $scope.members = _.filter($scope.members, (member1) -> member.project_id != member1.project_id )
        (response) -> alertService.add("danger", response.data.error, 6000)
      )

    $scope.addSelectedStudent = () ->
      GroupMember.create(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          group_id: $scope.selectedGroup.id
          project_id: $scope.selectedStudent.project_id
        }
        (member) -> $scope.members.push(member)
        (response) -> alertService.add("danger", response.data.error, 6000)
      )
      $scope.selectedStudent = null

    $scope.studentDetails = (student) ->
      if student && student.student_id && student.name
        "#{student.student_id} #{student.name}"
      else
        "Select Student"

    $scope.$watch "selectedGroupset", (newValue, oldValue) ->
      if $scope.groups && $scope.groups.length > 0
        $scope.selectGroup($scope.groups[0])
      else
        $scope.selectGroup(null)
)