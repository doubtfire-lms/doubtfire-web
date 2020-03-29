angular.module('doubtfire.units.states.edit.directives.unit-group-set-editor', [])

#
# Editor for editing a unit's group sets. Can also add new groups to
# newly created group sets and then and add new members to those groups.
#
.directive('unitGroupSetEditor', ->
  restrict: 'E'
  templateUrl: 'units/states/edit/directives/unit-group-set-editor/unit-group-set-editor.tpl.html'
  replace: true
  controller: ($scope, GroupSet, Group, GroupMember, gradeService, alertService, CsvResultModal) ->

    $scope.addGroupSet = ->
      gsCount = $scope.unit.group_sets.length
      name = if gsCount == 0 then "Group Work" else "Group Work Set #{gsCount + 1}"
      GroupSet.create(
        { unit_id: $scope.unit.id, group_set: { name: name } }
        (gs) ->
          $scope.unit.group_sets.push(gs)
          alertService.add("success", "Group set created.", 2000)
        (response) ->
          alertService.add("danger", "Failed to create group set. #{response.data.error}", 6000)
      )

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
              keep_groups_in_same_class: data.keep_groups_in_same_class,
              capacity: data.capacity
            }
        }
        (response) -> alertService.add("success", "Group set updated.", 2000)
        (response) -> alertService.add("danger", "Failed to update group set. #{response.data.error}", 6000)
      )

    $scope.removeGroupSet = (gs) ->
      GroupSet.delete(
        { unit_id: $scope.unit.id, id: gs.id },
        (response) ->
          $scope.unit.group_sets = _.filter($scope.unit.group_sets, (gs1) -> gs1.id != gs.id )
          newGs = $scope.unit.group_sets[$scope.unit.group_sets.indexOf(gs) - 1]
          $scope.selectGroupSet(newGs) if gs is $scope.selectedGroupSet
          alertService.add("success", "Group set deleted.", 2000)
        (response) ->
          alertService.add("danger", "Failed to delete group set. #{response.data.error}", 6000)
      )

    $scope.selectGroupSet = (gs) ->
      $scope.selectedGroupSet = gs
      # Notify children of updates
      $scope.$broadcast 'UnitGroupSetEditor/SelectedGroupSetChanged', { id: gs?.id }

    $scope.studentStaffOptions = [
      { value: true, text: "Staff and Students" }
      { value: false, text: "Staff Only" }
    ]

    $scope.tutorialOptions = [
      { value: true, text: "Same Tutorial" }
      { value: false, text: "Any Tutorial" }
    ]

    if $scope.unit.group_sets.length > 0
      $scope.selectGroupSet($scope.unit.group_sets[0])

    $scope.csvImportResponse = {}
    $scope.groupCSV = { file: { name: 'Group CSV', type: 'csv'  } }
    $scope.groupCSVUploadUrl = -> GroupSet.groupCSVUploadUrl($scope.unit, $scope.selectedGroupSet)
    $scope.groupStudentCSVUploadUrl = -> GroupSet.groupStudentCSVUploadUrl($scope.unit, $scope.selectedGroupSet)
    $scope.isGroupCSVUploading = null
    $scope.onGroupCSVSuccess = (response) ->
      CsvResultModal.show 'Group CSV upload results.', response
      $scope.selectGroupSet($scope.selectedGroupSet)
    $scope.onGroupCSVComplete = ->
      $scope.isGroupCSVUploading = null

    $scope.downloadGroupCSV = -> GroupSet.downloadCSV($scope.unit, $scope.selectedGroupSet)
    $scope.downloadGroupStudentCSV = -> GroupSet.downloadStudentCSV($scope.unit, $scope.selectedGroupSet)
)
