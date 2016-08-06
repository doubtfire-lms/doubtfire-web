_ = require('underscore')

#
# Editor for editing a unit's groupsets. Can also add new groups to
# newly created groupsets and then and add new members to those groups.
#
mod = angular.module('doubtfire.units.unit-groupset-editor', [])

.directive('unitGroupsetEditor', ->
  restrict: 'E'
  template: require('./unit-groupset-editor.tpl.html')
  replace: true
  controller: ($scope, GroupSet, Group, GroupMember, gradeService, alertService, CsvResultModal) ->

    $scope.addGroupSet = () ->
      if $scope.unit.group_sets.length == 0
        GroupSet.create(
          { unit_id: $scope.unit.id, group_set: { name: "Group Work" } }
          (gs) -> $scope.selectGroupSet(gs); $scope.unit.group_sets.push(gs)
          (response) -> alertService.add("danger", "Failed to create group set. #{response.data.error}", 6000)
        )
      else
        GroupSet.create(
          { unit_id: $scope.unit.id, group_set: { name: "More Group Work" } }
          (gs) -> $scope.unit.group_sets.push(gs)
          (response) -> alertService.add("danger", "Failed to create group set. #{response.data.error}", 6000)
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
              keep_groups_in_same_class: data.keep_groups_in_same_class
            }
        }
        (response) -> alertService.add("success", "Group set updated.", 2000)
        (response) -> alertService.add("danger", "Failed to update group set. #{response.data.error}", 6000)
      )

    $scope.removeGroupSet = (gs) ->
      # console.log GroupSet
      GroupSet.delete(
        { unit_id: $scope.unit.id, id: gs.id },
        (response) -> $scope.unit.group_sets = _.filter($scope.unit.group_sets, (gs1) -> gs1.id != gs.id )
        (response) -> alertService.add("danger", "Failed to delete group set. #{response.data.error}", 6000)
      )
      $scope.selectGroupSet(null) if gs is $scope.selectedGroupset

    $scope.selectGroupSet = (gs) ->
      $scope.selectedGroupset = gs
      $scope.$digest #notify

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
    $scope.groupCSVUploadUrl = -> GroupSet.groupCSVUploadUrl($scope.unit, $scope.selectedGroupset)
    $scope.isGroupCSVUploading = null
    $scope.onGroupCSVSuccess = (response) ->
      CsvResultModal.show 'Group CSV upload results.', response
      $scope.unit.refresh()
    $scope.onGroupCSVComplete = () ->
      $scope.isGroupCSVUploading = null

    $scope.downloadGroupCSV = () ->
      GroupSet.downloadCSV($scope.unit, $scope.selectedGroupset)
)

module.exports = mod.name
