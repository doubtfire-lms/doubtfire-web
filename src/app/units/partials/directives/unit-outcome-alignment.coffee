angular.module('doubtfire.units.partials.unit-outcome-alignment',[])

.directive('unitOutcomeAlignment', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-outcome-alignment.tpl.html'
  controller: ($scope, $filter, currentUser, unitService, alertService, gradeService, LearningAlignments) ->

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
          $scope.visualisationData = $scope.calculateAlignmentVisualisation($scope.unit)
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
          $scope.visualisationData = $scope.calculateAlignmentVisualisation($scope.unit)
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)

    $scope.updateRating = (align) ->
      data = { unit_id: $scope.unit.id }
      _.extend(data, align)

      LearningAlignments.update(data,
        (response) ->
          alertService.add("success", "Task - Outcome alignment rating saved", 2000)
          $scope.visualisationData = $scope.calculateAlignmentVisualisation($scope.unit)
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
          $scope.visualisationData = $scope.calculateAlignmentVisualisation($scope.unit)
        (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      )

    $scope.visualisationData = []

    $scope.calculateAlignmentVisualisation = (unit) ->
      result = []
      outcomes = {}
      _.each unit.ilos, (outcome) ->
        outcomes[outcome.id] = {
          0: []
          1: []
          2: []
          3: []
        }

      _.each unit.task_outcome_alignments, (align) ->
        td = unit.taskDef(align.task_definition_id)
        outcomes[align.learning_outcome_id][td.target_grade].push align.rating

      values = {
        '0': []
        '1': []
        '2': []
        '3': []
      }

      _.each outcomes, (outcome, key) ->
        _.each outcome, (tmp, key1) ->
          scale = Math.pow(2, parseInt(key1,10))
          values[key1].push [ $scope.unit.outcome(parseInt(key,10)).name,  _.reduce(tmp, ((memo, num) -> memo + num), 0) * scale ]

      _.each values, (vals, idx) ->
        result.push { key: gradeService.grades[idx], values: vals }

      result

    $scope.visualisationData = $scope.calculateAlignmentVisualisation($scope.unit)

    $scope.yFunction = () ->
      (d) ->
        d[1]

    $scope.xFunction = () ->
      (d) ->
        d[0]

)