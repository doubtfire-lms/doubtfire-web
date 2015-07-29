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

    $scope.saveGroup = (grp, id) ->
      Group.update(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          id: id,
          group: {
            name: grp.name,
            tutorial_id: grp.tutorial_id,
          }
        }, (response) ->
          alertService.add("info", "#{grp.name} was updated", 3000)
          # Update the tutorial if need be
          grp = _.find($scope.groups, (g) -> g.id is id)
          grp?.tutorial = $scope.selectTutorial(grp.tutorial_id)
        (response) -> alertService.add("danger", response.data.error, 6000)
      )

    $scope.removeGroup = (grp) ->
      $scope.selectGroup(null) if grp is $scope.selectedGroup
      Group.delete(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          id: grp.id
        },
          (response) ->
            $scope.groups = _.filter($scope.groups, (grp1) -> grp.id != grp1.id )
            alertService.add("info", "#{grp.name} was deleted", 3000)
        )

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

    $scope.addSelectedStudent = (student) ->
      console.log $scope
      GroupMember.create(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          group_id: $scope.selectedGroup.id
          project_id: student.project_id
        }
        (member) ->
          $scope.members.push(member)
          addStudentForm.reset()
        (response) -> alertService.add("danger", response.data.error, 6000)
      )

    $scope.studentDetails = (student) ->
      if student && student.student_id && student.name
        "#{student.student_id} #{student.name}"
      else
        "Select Student"

    $scope.$watch "selectedGroupset", (newValue, oldValue) ->
      if $scope.groups?.length > 0
        $scope.selectGroup($scope.groups[0])
      else
        $scope.selectGroup(null)
)