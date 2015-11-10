angular.module('doubtfire.units.partials.unit-outcome-alignment',[])

.directive('unitOutcomeAlignment', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-outcome-alignment.tpl.html'
  controller: ($scope, $filter, currentUser, unitService, alertService, LearningAlignments) ->

    $scope.selectAlignmentBy = 'Outcome'
    $scope.selectedOutcome = null

    $scope.selectOutcome = (outcome) ->
      $scope.selectedOutcome = outcome
      $scope.selectedTask = null
      $scope.selectAlignmentBy = 'Outcome'

    $scope.selectTask = (task) ->
      $scope.selectedOutcome = null
      $scope.selectedTask = task
      $scope.selectAlignmentBy = 'Task'

    addLink = (data) ->
      LearningAlignments.create data,
        (response) ->
          $scope.unit.task_outcome_alignments.push(response)
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)

    $scope.addTask = (taskDef) ->
      if $scope.selectedOutcome
        data = {
          unit_id: $scope.unit.id
          learning_outcome_id: $scope.selectedOutcome.id
          task_definition_id: taskDef.id
          rating: 3
          description: 'Provide rationale.'
        }
        addLink(data)

    $scope.addOutcome = (outcome) ->
      if $scope.selectedTask
        data = {
          unit_id: $scope.unit.id
          learning_outcome_id: outcome.id
          task_definition_id: $scope.selectedTask.id
          rating: 3
          description: 'Provide rationale.'
        }
        addLink(data)

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

    $scope.removeTaskAlignment = (align) ->
      data = { unit_id: $scope.unit.id }
      _.extend(data, align)

      LearningAlignments.delete(data,
        (response) ->
          $scope.unit.task_outcome_alignments = _.without $scope.unit.task_outcome_alignments, align
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )

)