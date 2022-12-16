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
.controller('CreateUnitModalCtrl', ($scope, $modalInstance, DoubtfireConstants, alertService, units, newUnitService, analyticsService) ->
  analyticsService.event 'Unit Admin', 'Started to Create Unit'
  $scope.units = units
  $scope.unit = { code: null, name: null }
  $scope.saveUnit = ->
    newUnitService.create($scope.unit).subscribe(
      next: (response) ->
        alertService.success("Unit created.")
        $modalInstance.close()
      error: (response) ->
        alertService.danger(response)
    )
  # Get the configurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName
)
