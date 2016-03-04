angular.module('doubtfire.units.partials.admin-unit-ilo-directive',[])

.directive('adminUnitIlos', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/admin-unit-ilos.tpl.html'
  controller: ($scope, $modal, $rootScope, IntendedLearningOutcome, alertService, CSVResultModal) ->

    $scope.batchFiles = { file: { name: 'CSV Data', type: 'csv'  } }
    $scope.batchOutcomeUrl = ->
      IntendedLearningOutcome.getOutcomeBatchUploadUrl($scope.unit)
    $scope.onBatchOutcomeSuccess = (response) ->
      CSVResultModal.show "Outcome CSV Upload Results", response
      if response.success.length > 0
        $scope.unit.refresh()


    $scope.editILO = (ilo) ->
      $modal.open
        controller: 'IloModalCtrl'
        templateUrl: 'units/partials/templates/admin-unit-ilo-modal.tpl.html'
        resolve: {
          ilo: -> ilo || { name: null, description: null, abbreviation: null }
          isNew: -> not ilo?
          unit: -> $scope.unit
        }
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
