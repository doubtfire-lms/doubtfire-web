angular.module('doubtfire.visualisations.task-completion-box-plot', [])
.directive 'taskCompletionBoxPlot', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/visualisation.tpl.html'
  scope:
    rawData: '=data'
    unit: '='
    type: '='
    height: '=?'
    showLegend: '=?'
  controller: ($scope, $filter, $timeout, gradeService, Visualisation) ->
    $scope.showLegend = unless $scope.showLegend? then true else $scope.showLegend
    $scope.height     = unless $scope.height?     then 600  else $scope.height

    refreshData = (newData) ->
      if $scope.type isnt 'grade'
        $scope.data = [
          {
            label: $filter('ucfirst')($scope.type)
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
          label = gradeService.grades[id]
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

    [$scope.options, $scope.config] = Visualisation 'boxPlotChart', 'Task Completion Summary Box Plot', {
      x: (d) -> d.label
      height: $scope.height
      showXAxis: $scope.showLegend
      margin:
        top:    if $scope.showLegend then 20 else 20
        right:  if $scope.showLegend then 10 else 10
        bottom: if $scope.showLegend then 60 else 20
        left:   if $scope.showLegend then 80 else 40
      yAxis:
        axisLabel: if $scope.showLegend then "Number of tasks completed"
      tooltip:
        enabled: $scope.showLegend
      maxBoxWidth: 75
      yDomain: [0, Math.ceil($scope.unit.task_definitions.length/2) * 2] #round to nearest 2
    }, {}
