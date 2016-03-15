angular.module('doubtfire.units.modals.unit-ilo-edit-modal', [])
#
# Modal to edit or create a new ILO
#
.factory('UnitILOEditModal', ($modal) ->
  UnitILOEditModalCtrl = {}

  #
  # Provide unit, and optionally a ILO. If no ILO is provided
  # it will assume you want to make a new ILO
  #
  UnitILOEditModalCtrl.show = (unit, ilo) ->
    $modal.open
      controller: 'UnitILOEditModalCtrl'
      templateUrl: 'units/modals/unit-ilo-edit-modal/unit-ilo-edit-modal.tpl.html'
      resolve: {
        ilo: -> ilo
        unit: -> unit
      }

  UnitILOEditModalCtrl
)
.controller('UnitILOEditModalCtrl', ($scope, $modalInstance, ilo, unit, IntendedLearningOutcome, alertService) ->
  prototypeIlo = { name: null, description: null, abbreviation: null }
  $scope.ilo = ilo or prototypeIlo
  $scope.isNew = !ilo?

  $scope.saveILO = ->
    save_data = {
      unit_id: unit.id
      name: $scope.ilo.name
      description: $scope.ilo.description
      abbreviation: $scope.ilo.abbreviation
    }

    if $scope.isNew
      IntendedLearningOutcome.create(save_data,
        (response) ->
          $modalInstance.close(response)
          unit.ilos.push(response)
          alertService.add("success", "Intended Learning Outcome Added", 2000)
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
    else
      save_data.id = $scope.ilo.id
      IntendedLearningOutcome.update(save_data).$promise.then (
        (response) ->
          $modalInstance.close(response)
          alertService.add("success", "Intended Learning Outcome Updated", 2000)
      ),
      (
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )
)
