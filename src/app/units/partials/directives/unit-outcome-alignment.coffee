angular.module('doubtfire.units.partials.unit-outcome-alignment',[])

.directive('unitOutcomeAlignment', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-outcome-alignment.tpl.html'
  controller: ($scope, $filter, currentUser, unitService, alertService, LearningAlignments) ->
    $scope.saveTaskAlignment = (data, id) ->
      data.unit_id = $scope.unit.id
      data.id = id
      LearningAlignments.update data,
        (response) ->
          alertService.add("success", "Task - Outcome alignment saved", 2000)
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
    $scope.updateRating = (align) ->
      data = { unit_id: $scope.unit.id }
      _.extend(data, align)

      LearningAlignments.update(data,
        (response) ->
          alertService.add("success", "Task - Outcome alignment rating saved", 2000)
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )

)