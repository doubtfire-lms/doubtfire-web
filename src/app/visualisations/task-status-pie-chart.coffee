angular.module('doubtfire.visualisations.task-status-pie-chart', [])
.directive 'taskStatusPieChart', ->
  restrict: 'E'
  templateUrl: 'visualisations/visualisation.tpl.html'
  scope:
    rawData: '=data'
    showLegend: '=?'
    height: '=?'
  controller: ($scope, $timeout, newTaskService, Visualisation) ->
    colors = newTaskService.statusColors

    updateData = (rawData) ->
      $scope.total = _.chain(rawData)
                      .values()
                      .reduce(((memo, num) -> memo + num), 0)
                      .value()
      $scope.data = _.map rawData, (value, status) ->
        { key: newTaskService.statusLabels.get(status), y: value, statusKey: status }
      $timeout ->
        $scope.api.refresh() if $scope.api?.refresh?

    updateData($scope.rawData)

    $scope.$watch 'rawData', updateData

    zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 }

    [$scope.options, $scope.config] = Visualisation 'pieChart', 'Task Status Summary Pie Chart', {
      color: (d, i) ->
        colors.get(d.statusKey)
      x: (d) -> d.key
      y: (d) -> d.y
      showLabels: no
      margin: zeroMargin
      height: $scope.height
      legend:
        padding: 64
        margin: zeroMargin
      showLegend: $scope.showLegend
      tooltip:
        valueFormatter: (d) ->
          pct   = Math.round((d / $scope.total) * 100)
          "#{pct}%"
        keyFormatter: (d) ->
          d
    }, {}
