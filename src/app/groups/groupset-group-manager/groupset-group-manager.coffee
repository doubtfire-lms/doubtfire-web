mod = angular.module('doubtfire.groups.groupset-group-manager', [])

#
# Manager directive for tutors to add and remove group
# members from a group within a group set context
#
.directive('groupsetGroupManager', ->
  restrict: 'E'
  template: require('./groupset-group-manager.tpl.html')
  replace: true
  controller: ($scope, GroupSet, Group, GroupMember, gradeService, alertService, projectService) ->
    $scope.staffFilter = 'mine'

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

    $scope.$watch "groups", (newValue, oldValue) ->
      if $scope.groups?.length > 0
        $scope.selectGroup($scope.groups[0])
      else
        $scope.selectGroup(null)
)

module.exports = mod.name
