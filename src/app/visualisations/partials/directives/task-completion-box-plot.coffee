angular.module('doubtfire.visualisations.task-completion-box-plot', [])
.directive 'taskCompletionBoxPlot', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/partials/templates/visualisation.tpl.html'
  scope:
    rawData: '=data'
    unit: '='
    type: '='
  controller: ($scope, $timeout, gradeService, Visualisation) ->
    refreshData = (newData) ->
      if $scope.type is 'unit'
        $scope.data = [
          {
            label: "Unit"
            values: {
              Q1: newData.lower
              Q2: newData.median
              Q3: newData.upper
              whisker_low: newData.min
              whisker_high: newData.max
            }
          }
        ]
      else
        $scope.data = _.map newData, (d, id) ->
          label = if $scope.type is 'tutorial' then $scope.unit.tutorialFromId(id).abbreviation else gradeService.grades[id]
          {
            label: label,
            values: {
              Q1: d.lower
              Q2: d.median
              Q3: d.upper
              whisker_low: d.min
              whisker_high: d.max
            }
          }
      $timeout ->
        if $scope.api?.refresh?
          $scope.api.refresh()

    $scope.$watch 'rawData', refreshData
    refreshData($scope.rawData)

    [$scope.options, $scope.config] = Visualisation 'boxPlotChart', {
      colors: ['darkblue']
      x: (d) -> d.label
      margin:
        top: 20
        right: 10
        bottom: 60
        left: 80
      yAxis:
        axisLabel: "Number of tasks completed"
      maxBoxWidth: 75
      yDomain: [0, Math.ceil($scope.data.range/2) * 2] #round to nearest 2
    }, {}
