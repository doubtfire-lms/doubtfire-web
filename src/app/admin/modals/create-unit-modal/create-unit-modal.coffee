angular.module('doubtfire.admin.modals.create-unit-modal', [])

#
# This modal allows administrators to quickly create new units
#
.factory('CreateUnitModal', ($modal) ->
  CreateUnitModal = {}
  CreateUnitModal.show = (units) ->
    $modal.open
      controller: 'CreateUnitModalCtrl'
      templateUrl: 'admin/modals/create-unit-modal/create-unit-modal.tpl.html'
      resolve:
        units: -> units
  CreateUnitModal
)
.controller('CreateUnitModalCtrl', ($scope, $modalInstance, DoubtfireConstants, alertService, units, Unit, analyticsService) ->
  analyticsService.event 'Unit Admin', 'Started to Create Unit'
  $scope.units = units
  $scope.unit = { code: null, name: null }
  $scope.saveUnit = ->
    Unit.create(
      { unit: $scope.unit }
      (response) ->
        alertService.add("success", "Unit created.", 2000)
        $modalInstance.close()
        $scope.units.push(response)
        analyticsService.event 'Unit Admin', 'Saved New Unit'
      (response) ->
        alertService.add 'danger', "Error creating unit - #{response.data.error}"
    )
  # Get the configurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName
)
