angular.module('doubtfire.units.states.edit.directives.unit-group-set-editor', [])

#
# Editor for editing a unit's group sets. Can also add new groups to
# newly created group sets and then and add new members to those groups.
#
.directive('unitGroupSetEditor', ->
  restrict: 'E'
  templateUrl: 'units/states/edit/directives/unit-group-set-editor/unit-group-set-editor.tpl.html'
  replace: true
  controller: ($scope, newGroupSetService, gradeService, alertService, CsvResultModal) ->

    $scope.addGroupSet = ->
      groupSet = newGroupSetService.createInstanceFrom({}, $scope.unit)

      gsCount = $scope.unit.groupSets.length
      groupSet.name = if gsCount == 0 then "Group Work" else "Group Work Set #{gsCount + 1}"

      newGroupSetService.store(groupSet, {cache: $scope.unit.groupSetsCache}).subscribe({
        next: (gs) ->
          alertService.add("success", "Group set created.", 2000)
        error: (message) ->
          alertService.add("danger", "Failed to create group set. #{message}", 6000)
      })

    $scope.saveGroupSet = (data, groupSet) ->
      groupSet.name = data.name
      groupSet.allowStudentsToCreateGroups = data.allowStudentsToCreateGroups
      groupSet.allowStudentsToManageGroups = data.allowStudentsToManageGroups
      groupSet.keepGroupsInSameClass = data.keepGroupsInSameClass
      groupSet.capacity = data.capacity

      newGroupSetService.update(groupSet).subscribe({
        next: (response) -> alertService.add("success", "Group set updated.", 2000)
        error: (message) -> alertService.add("danger", "Failed to update group set. #{message}", 6000)
      })

    $scope.toggleLocked = (gs) ->
      gs.locked = !gs.locked
      newGroupSetService.update(gs).subscribe({
        next: (response) ->
          alertService.add("success", "#{if response.locked then 'Locked' else 'Unlocked'} #{gs.name}", 2000)
        error: (message) ->
          alertService.add("danger", "Failed to #{if gs.locked then 'unlock' else 'lock'} #{gs.name}. #{message}", 6000)
      })

    $scope.removeGroupSet = (gs) ->
      newGroupSetService.delete(gs, {cache: $scope.unit.groupSetsCache}).subscribe({
        next: (response) ->
          if gs is $scope.selectedGroupSet
            $scope.selectGroupSet($scope.unit.groupSets[0])
          alertService.add("success", "Group set deleted.", 2000)
        error: (message) -> alertService.add("danger", "Failed to delete group set. #{message}", 6000)
      })

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

    if $scope.unit.groupSets.length > 0
      $scope.selectGroupSet($scope.unit.groupSets[0])

    $scope.csvImportResponse = {}
    $scope.groupCSV = { file: { name: 'Group CSV', type: 'csv'  } }
    $scope.groupCSVUploadUrl = -> $scope.selectedGroupSet.groupCSVUploadUrl()
    $scope.groupStudentCSVUploadUrl = -> $scope.selectedGroupSet.groupStudentCSVUploadUrl()
    $scope.isGroupCSVUploading = null
    $scope.onGroupCSVSuccess = (response) ->
      CsvResultModal.show 'Group CSV upload results.', response
      $scope.selectGroupSet($scope.selectedGroupSet)
    $scope.onGroupCSVComplete = ->
      $scope.isGroupCSVUploading = null

    $scope.downloadGroupCSV = ->
      fileDownloaderService.downloadFile($scope.selectedGroupSet.groupCSVUploadUrl(), "#{$scope.unit.code}-group-sets.csv")
    $scope.downloadGroupStudentCSV = ->
      fileDownloaderService.downloadFile($scope.selectedGroupSet.groupStudentCSVUploadUrl(), "#{unit.code}-#{$scope.selectedGroupSet.name}-students.csv")
)
