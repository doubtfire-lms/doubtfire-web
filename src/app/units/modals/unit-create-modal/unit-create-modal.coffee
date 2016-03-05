angular.module('doubtfire.units.modals.unit-create-modal', [])

#
# This modal allows administrators to quickly create new units
#
.factory('UnitCreateModal', ($modal) ->
  UnitCreateModal = {}

  UnitCreateModal.show = (units) ->
    $modal.open
      controller: 'UnitCreateModalCtrl'
      templateUrl: 'units/modals/unit-ilo-edit-modal/unit-ilo-edit-modal.tpl.html'
      resolve:
        units: -> units

  UnitCreateModal
)
.controller('UnitCreateModalCtrl', ($scope, $modalInstance, alertService, units, Unit, analyticsService) ->
  analyticsService.event 'Unit Admin', 'Started to Create Unit'

  $scope.unit = new Unit { id: -1, active: true, code: "COS????", name: "Unit Name" }
  $scope.saveSuccess = (unit) ->
    alertService.add("success", "Unit created.", 2000)
    $modalInstance.close()
    units.push(unit)
    analyticsService.event 'Unit Admin', 'Saved New Unit'
)
