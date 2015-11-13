angular.module('doubtfire.visualisations.alignment-bar-chart', [])
.directive 'alignmentBarChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/partials/templates/visualisation.tpl.html'
  scope:
    project: '='
    unit: '='
    source: '='
    taskStatusFactor: '='

  controller: ($scope, Visualisation, projectService, gradeService, taskService) ->
    xFn = (d) -> d.label
    yFn = (d) -> d.value

    [$scope.options, $scope.config] = Visualisation 'multiBarChart', {
      clipEdge: yes
      stacked: yes
      height: 440
      width: 600
      margin:
        left: 75
        right: 50
      rotateLabels: 30
      duration: 500
      x: xFn
      y: yFn
      forceY: 0
      showYAxis: no
    }, {}

    $scope.data = []

    $scope.calculateAlignmentVisualisation = (source) ->
      unit = $scope.unit
      result = $scope.data
      result.length = 0

      outcomes = {}
      _.each unit.ilos, (outcome) ->
        outcomes[outcome.id] = {
          0: []
          1: []
          2: []
          3: []
        }

      _.each source.task_outcome_alignments, (align) ->
        td = unit.taskDef(align.task_definition_id)
        outcomes[align.learning_outcome_id][td.target_grade].push align.rating * $scope.taskStatusFactor(td.id)

      values = {
        '0': []
        '1': []
        '2': []
        '3': []
      }

      _.each outcomes, (outcome, key) ->
        _.each outcome, (tmp, key1) ->
          scale = Math.pow(2, parseInt(key1,10))
          values[key1].push { label: $scope.unit.outcome(parseInt(key,10)).name, value:  _.reduce(tmp, ((memo, num) -> memo + num), 0) * scale }

      _.each values, (vals, idx) ->
        result.push { key: gradeService.grades[idx], values: vals }

      if $scope.api?
        $scope.api.update()

    $scope.calculateAlignmentVisualisation($scope.source)

    $scope.$on('UpdateAlignmentChart', () ->
      $scope.calculateAlignmentVisualisation($scope.source)
    )