angular.module('doubtfire.visualisations.target-grade-pie-chart', [])
.directive 'targetGradePieChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/visualisation.tpl.html'
  scope:
    rawData: '=data'
    showLegend: '=?'
    height: '=?'
  controller: ($scope, $timeout, gradeService, projectService, Visualisation) ->
    colors = gradeService.gradeColors

    updateData = (rawData) ->
      $scope.data = _.map rawData, (value, grade) ->
        $scope.total = _.chain(rawData)
                        .values()
                        .reduce(((memo, num) -> memo + num), 0)
                        .value()
        { key: gradeService.grades[grade], y: value, status_key: grade }
      $timeout ->
        if $scope.api?.refresh?
          $scope.api.refresh()

    updateData($scope.rawData)

    $scope.$watch 'rawData', updateData

    zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 }

    [$scope.options, $scope.config] = Visualisation 'pieChart', 'Target Grade Summary Chart', {
      color: (d, i) ->
        colors[d.status_key]
      x: (d) -> d.key
      y: (d) -> d.y
      showLabels: no
      margin: zeroMargin
      legend:
        padding: 64
        margin: zeroMargin
      height: $scope.height
      showLegend: $scope.showLegend
      tooltip:
        valueFormatter: (d) ->
          pct   = Math.round((d / $scope.total) * 100)
          "#{pct}%"
        keyFormatter: (d) ->
          d
    }, {}
