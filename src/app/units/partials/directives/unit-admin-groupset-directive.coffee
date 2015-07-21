angular.module('doubtfire.units.partials.unit-admin-groupset-directive', [])

#
# Task Plagiarism Report shows how the task relates tasks submitted by
# other students.
#

.directive('unitAdminGroupsetTab', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-admin-groupset-tab.tpl.html'

  controller: ($scope, GroupSet, Group, GroupMember, gradeService) ->
    # pagination of groups
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15

    $scope.addGroupSet = () ->
      if $scope.unit.group_sets.length == 0
        GroupSet.create( { unit_id: $scope.unit.id, group_set: { name: "Group Work" } }, (gs) -> $scope.unit.group_sets.push(gs) )
      else
        GroupSet.create( { unit_id: $scope.unit.id, group_set: { name: "More Group Work" } }, (gs) -> $scope.unit.group_sets.push(gs) )

    $scope.saveGroupSet = (data, id) ->
      GroupSet.update(
        {
          unit_id: $scope.unit.id,
          id: id,
          group_set:
            {
              name: data.name
              allow_students_to_create_groups: data.allow_students_to_create_groups,
              allow_students_to_manage_groups: data.allow_students_to_manage_groups,
              keep_groups_in_same_class: data.keep_groups_in_same_class
            }
        } )

    $scope.removeGroupSet = (gs) ->
      GroupSet.delete( { unit_id: $scope.unit.id, id: gs.id }, (response) -> $scope.unit.group_sets = _.filter($scope.unit.group_sets, (gs1) -> gs1.id != gs.id ) )

    $scope.selectGroupSet = (gs) ->
      $scope.unit.getGroups gs, (groups) ->
        $scope.groups = groups
        $scope.selectedGroupset = gs

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
        } )

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

    if $scope.unit.group_sets.length > 0
      $scope.selectGroupSet($scope.unit.group_sets[0])

)
