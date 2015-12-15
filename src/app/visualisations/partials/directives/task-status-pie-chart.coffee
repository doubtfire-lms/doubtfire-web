angular.module('doubtfire.visualisations.task-status-pie-chart', [])
.directive 'taskStatusPieChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/partials/templates/visualisation.tpl.html'
  scope:
    rawData: '=data'
  controller: ($scope, $timeout, taskService, projectService, Visualisation) ->
    colors = taskService.statusColors

    updateData = (rawData) ->
      $scope.total = _.chain(rawData)
                      .values()
                      .reduce(((memo, num) -> memo + num), 0)
                      .value()
      $scope.data = _.map rawData, (value, status) ->
        { key: taskService.statusLabels[status], y: value, status_key: status }
      $timeout ->
        $scope.api.refresh() if $scope.api?.refresh?

    updateData($scope.rawData)

    $scope.$watch 'rawData', updateData

    [$scope.options, $scope.config] = Visualisation 'pieChart', {
      color: (d, i) ->
        colors[d.status_key]
      x: (d) -> d.key
      y: (d) -> d.y
      showLabels: no
      tooltip:
        valueFormatter: (d) ->
          pct   = Math.round((d / $scope.total) * 100)
          "#{pct}%"
        keyFormatter: (d) ->
          d
    }, {}
