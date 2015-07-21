angular.module('doubtfire.units.partials.unit-admin-groupset-directive', [])

#
# Task Plagiarism Report shows how the task relates tasks submitted by
# other students.
#

.directive('unitAdminGroupsetTab', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-admin-groupset-tab.tpl.html'

  controller: ($scope, GroupSet, Group, GroupMember, gradeService, alertService) ->

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
      $scope.selectedGroupset = gs
      $scope.$digest #notify
    
    if $scope.unit.group_sets.length > 0
      $scope.selectGroupSet($scope.unit.group_sets[0])
)
