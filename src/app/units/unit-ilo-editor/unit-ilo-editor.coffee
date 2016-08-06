_ = require('lodash')

#
# Editor for modifying a unit's ILOs
#
mod = angular.module('doubtfire.units.unit-ilo-editor',[])

.directive('unitIloEditor', ->
  replace: true
  restrict: 'E'
  template: require('./unit-ilo-editor.tpl.html')
  controller: ($scope, $uibModal, $rootScope, IntendedLearningOutcome, alertService, CsvResultModal, UnitILOEditModal) ->
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

module.exports = mod.name
