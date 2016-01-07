angular.module('doubtfire.visualisations.achievement-box-plot', [])
.directive 'achievementBoxPlot', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/partials/templates/visualisation.tpl.html'
  scope:
    rawData: '=data'
    type: '='
    unit: '='
  controller: ($scope, $timeout, Visualisation, outcomeService) ->
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
      margin:
        top: 20
        right: 10
        bottom: 60
        left: 80
      yAxis:
        axisLabel: "ILO Achievement"
      maxBoxWidth: 75
      yDomain: [0, rangeMax]
    }, {}
