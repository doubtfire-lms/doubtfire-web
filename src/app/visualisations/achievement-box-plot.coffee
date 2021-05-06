angular.module('doubtfire.visualisations.achievement-box-plot', [])
.directive 'achievementBoxPlot', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/visualisation.tpl.html'
  scope:
    rawData: '=data'
    type: '='
    unit: '='
    pctHolder: '='
    height: '=?'
    showLegend: '=?'
  controller: ($scope, $timeout, Visualisation, outcomeService) ->
    $scope.showLegend = unless $scope.showLegend? then true else $scope.showLegend
    $scope.height     = unless $scope.height?     then 600  else $scope.height

    iloValues = outcomeService.calculateTargets($scope.unit, $scope.unit, outcomeService.unitTaskStatusFactor())
    iloMaxes = _.mapValues iloValues, (d, k) -> _.reduce d, ((memo, value) -> memo + value), 0
    rangeMax = _.max _.values(iloMaxes)

    refreshData = (newData) ->
      isPct = ($scope.pctHolder? and $scope.pctHolder.pct)
      if isPct
        $scope.options.chart.yDomain = [0, 1]
      else
        $scope.options.chart.yDomain = [0, rangeMax]

      $scope.data = _.map newData, (d, id) ->
        max = iloMaxes[id]
        if (! max?) or max == 0 or ! isPct
          max = 1
        label = _.find($scope.unit.ilos, { id: +id }).abbreviation
        {
          label: label,
          values: {
            Q1: d.lower / max
            Q2: d.median / max
            Q3: d.upper / max
            whisker_low: d.min / max
            whisker_high: d.max / max
          }
        }
      $timeout ->
        if $scope.api?.refresh?
          $scope.api.refresh()

    [$scope.options, $scope.config] = Visualisation 'boxPlotChart', 'ILO Achievement Box Plot', {
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
      yDomain: [0, 1]
    }, {}, 'Achievement Box Plot'

    # $scope.$watch 'rawData', refreshData($scope.rawData)
    $scope.$watch 'pctHolder.pct', (newData, oldData) -> if newData != oldData then refreshData($scope.rawData)

    refreshData($scope.rawData)
