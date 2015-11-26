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
  controller: ($scope, Visualisation, projectService, gradeService, taskService, outcomeService) ->
    xFn = (d) -> d.label
    yFn = (d) -> d.value

    [$scope.options, $scope.config] = Visualisation 'multiBarChart', {
      clipEdge: yes
      stacked: yes
      height: 440
      width: 675
      duration: 500
      x: xFn
      y: yFn
      forceY: 0
      showYAxis: no
    }, {}

    $scope.data = []

    $scope.calculateAlignmentVisualisation = (source, taskStatusFactor) ->
      unit = $scope.unit
      _.extend $scope.data, outcomeService.targetsByGrade($scope.unit, source)
      
      if $scope.api?
        $scope.api.update()

    $scope.calculateAlignmentVisualisation($scope.source, $scope.taskStatusFactor)

    $scope.$on('UpdateAlignmentChart', () ->
      $scope.calculateAlignmentVisualisation($scope.source, $scope.taskStatusFactor)
    )