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
.controller('UnitILOEditModalCtrl', ($scope, $modalInstance, ilo, unit, newLearningOutcomeService, alertService) ->
  prototypeIlo = { name: null, description: null, abbreviation: null }
  $scope.ilo = ilo or prototypeIlo
  $scope.isNew = !ilo?

  $scope.saveILO = ->
    if $scope.isNew
      newLearningOutcomeService.create({
        unitId: unit.id
      }, {
        body: {
          name: $scope.ilo.name
          description: $scope.ilo.description
          abbreviation: $scope.ilo.abbreviation
        },
        cache: unit.learningOutcomesCache
      }).subscribe({
        next: (response) ->
          $modalInstance.close(response)
          alertService.add("success", "Intended Learning Outcome Added", 2000)
        error: (response) ->
          alertService.add("danger", response, 6000)
      })
    else
      newLearningOutcomeService.update( {unitId: unit.id, id: ilo.id}, {entity: ilo}).subscribe({
        next: (response) ->
          $modalInstance.close(response)
          alertService.add("success", "Intended Learning Outcome Updated", 2000)
        error: (response) ->
          alertService.add("danger", response, 6000)
      })
)
