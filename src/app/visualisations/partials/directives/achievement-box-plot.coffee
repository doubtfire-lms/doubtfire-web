angular.module('doubtfire.visualisations.achievement-box-plot', [])
.directive 'achievementBoxPlot', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/partials/templates/visualisation.tpl.html'
  scope:
    rawData: '=data'
    type: '='
    unit: '='
    height: '=?'
    showLegend: '=?'
  controller: ($scope, $timeout, Visualisation, outcomeService) ->
    $scope.showLegend = unless $scope.showLegend? then true else $scope.showLegend
    $scope.height     = unless $scope.height?     then 600  else $scope.height

    refreshData = (newData) ->
      $scope.data = _.map newData, (d, id) ->
        label = _.findWhere($scope.unit.ilos, { id: +id }).abbreviation
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

    iloValues = _.map outcomeService.targetsByGrade($scope.unit, $scope.unit), (d) -> _.pluck(d.values, 'value')

    rangeMax = _.max _.map iloValues, (d) -> _.reduce d, ((memo, value) -> memo + value), 0

    [$scope.options, $scope.config] = Visualisation 'boxPlotChart', {
      x: (d) -> d.label
      height: $scope.height
      showXAxis: $scope.showLegend
      margin:
        top:    if $scope.showLegend then 20 else 20
        right:  if $scope.showLegend then 10 else 10
        bottom: if $scope.showLegend then 60 else 20
        left:   if $scope.showLegend then 80 else 40
      yAxis:
        axisLabel: if $scope.showLegend then "ILO Achievement"
      tooltip:
        enabled: $scope.showLegend
      maxBoxWidth: 75
      yDomain: [0, rangeMax]
    }, {}
