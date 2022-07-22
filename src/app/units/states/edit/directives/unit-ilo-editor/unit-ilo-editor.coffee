angular.module('doubtfire.units.states.edit.directives.unit-ilo-editor',[])

#
# Editor for modifying a unit's ILOs
#
.directive('unitIloEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/edit/directives/unit-ilo-editor/unit-ilo-editor.tpl.html'
  controller: ($scope, $modal, $rootScope, newLearningOutcomeService, alertService, CsvResultModal, UnitILOEditModal, fileDownloaderService) ->
    $scope.unit.learningOutcomesCache.values.subscribe(
      (ilos) ->
        $scope.ilos = ilos
    )

    $scope.batchFiles = { file: { name: 'CSV Data', type: 'csv'  } }
    $scope.batchOutcomeUrl = ->
      $scope.unit.getOutcomeBatchUploadUrl()
    $scope.onBatchOutcomeSuccess = (response) ->
      CsvResultModal.show "Outcome CSV Upload Results", response
      if response.success.length > 0
        $scope.unit.refresh()

    $scope.editILO = (ilo) ->
      UnitILOEditModal.show $scope.unit, ilo

    $scope.createILO = ->
      $scope.editILO()

    $scope.downloadCSV = ->
      fileDownloaderService.downloadFile($scope.batchOutcomeUrl(), "#{$scope.unit.code}-learning-outcomes.csv")

    $scope.deleteILO = (ilo) ->
      newLearningOutcomeService.delete({ id: ilo.id, unitId: $scope.unit.id }, {entity: ilo, cache: $scope.unit.learningOutcomesCache}).subscribe({
        next: (response) ->
          alertService.add("success", "ILO #{ilo.id} was deleted successfully", 2000)
        error: (response) ->
          alertService.add("danger", "Error: " + response, 6000)
      })
)
