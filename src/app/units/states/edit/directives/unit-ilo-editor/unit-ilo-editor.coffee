angular.module('doubtfire.units.states.edit.directives.unit-ilo-editor',[])

#
# Editor for modifying a unit's ILOs
#
.directive('unitIloEditor', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/edit/directives/unit-ilo-editor/unit-ilo-editor.tpl.html'
  controller: ($scope, $modal, $rootScope, IntendedLearningOutcome, alertService, CsvResultModal, UnitILOEditModal) ->
    $scope.batchFiles = { file: { name: 'CSV Data', type: 'csv'  } }
    $scope.batchOutcomeUrl = ->
      IntendedLearningOutcome.getOutcomeBatchUploadUrl($scope.unit)
    $scope.onBatchOutcomeSuccess = (response) ->
      CsvResultModal.show "Outcome CSV Upload Results", response
      if response.success.length > 0
        $scope.unit.refresh()

    $scope.editILO = (ilo) ->
      UnitILOEditModal.show $scope.unit, ilo

    $scope.createILO = ->
      $scope.editILO()

    $scope.deleteILO = (ilo) ->
      IntendedLearningOutcome.delete { id: ilo.id, unit_id: $scope.unit.id },
        (response) ->
          $scope.unit.ilos = _.without $scope.unit.ilos, ilo
          alertService.add("info", "ILO #{ilo.id} was deleted successfully", 2000)
        (response) ->
          alertService.add("danger", "Error: " + response.data.error, 6000)
)
