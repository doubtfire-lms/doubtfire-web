angular.module('doubtfire.groups.partials.groupset-manage-directive', [])

.directive('groupsetManage', ->
  replace: true
  restrict: 'E'
  templateUrl: 'groups/partials/templates/groupset-manage-view.tpl.html'
  scope:
    assessingUnitRole: "="
    unit: "="
    selectedGroupset: "="

  controller: ($scope, $rootScope, Group, GroupMember, gradeService, alertService) ->
    # pagination of groups
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 5

    # initial sort orders
    $scope.memberSortOrder = 'student_name'
    $scope.groupSortOrder = 'name'

    $scope.$watch 'selectedGroupset', (newValue, oldValue) ->
      $scope.selectGroupSet(newValue)

    $scope.selectGroupSet = (gs) ->
      $scope.unit.getGroups gs, (groups) ->
        $scope.groups = groups

        if groups.length > 0
          $scope.selectGroup(groups[0])
        else
          $scope.selectGroup(null)

    $scope.addGroup = () ->
      Group.create(
        {
          unit_id: $scope.unit.id,
          group_set_id: $scope.selectedGroupset.id
          group:
            {
              name: "Group #{$scope.groups.length + 1}"
              tutorial_id: $scope.unit.tutorials[0].id
            }
        }, (grp) -> $scope.groups.push(grp) )

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

    $scope.selectGroup = (grp) ->
      if grp
        GroupMember.query { unit_id: $scope.unit.id, group_set_id: $scope.selectedGroupset.id, group_id: grp.id }, (members) ->
          $scope.members = members
          $scope.selectedGroup = grp
      else
        $scope.members = null
        $scope.selectedGroup = null

    $scope.selectTutorial = (id) ->
      _.find($scope.unit.tutorials, (t) -> t.id == id)

    $scope.gradeFor = (member) ->
      gradeService.grades[member.target_grade]

    $scope.removeGroupMember = (member) ->
      GroupMember.delete(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          group_id: $scope.selectedGroup.id
          id: member.project_id
        }, (response) -> $scope.members = _.filter($scope.members, (member1) -> member.project_id != member1.project_id ) )

    $scope.addSelectedStudent = () ->
      GroupMember.create(
        {
          unit_id: $scope.unit.id,
          group_set_id:$scope.selectedGroupset.id,
          group_id: $scope.selectedGroup.id
          project_id: $scope.selectedStudent.project_id
        }, (member) -> $scope.members.push(member))
      $scope.selectedStudent = null

    $scope.studentDetails = (student) ->
      if student && student.student_id && student.name
        "#{student.student_id} #{student.name}"
      else
        "Select Student"
)