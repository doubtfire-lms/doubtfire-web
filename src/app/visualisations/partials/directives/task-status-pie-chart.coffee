angular.module('doubtfire.visualisations.task-status-pie-chart', [])
.directive 'taskStatusPieChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/partials/templates/visualisation.tpl.html'
  scope:
    rawData: '=data'
    title: '@title'
    showLegend: '&showLegend'
    height: '&height'
  controller: ($scope, $timeout, taskService, projectService, Visualisation) ->
    colors = taskService.statusColors

    height = $scope.height()
    showLegend = $scope.showLegend()

    updateData = (rawData) ->
      $scope.total = _.chain(rawData)
                      .values()
                      .reduce(((memo, num) -> memo + num), 0)
                      .value()
      $scope.data = _.map rawData, (value, status) ->
        { key: taskService.statusLabels[status], y: value, status_key: status }
      $timeout ->
        if $scope.api?.refresh?
          $scope.api.refresh()

    updateData($scope.rawData)

    $scope.$watch 'rawData', updateData

    zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 }

    [$scope.options, $scope.config] = Visualisation 'pieChart', {
      color: (d, i) ->
        colors[d.status_key]
      x: (d) -> d.key
      y: (d) -> d.y
      showLabels: no
      margin: zeroMargin
      height: height
      legend:
        padding: 64
        margin: zeroMargin
      showLegend: showLegend
      caption:
        enable: true #$scope.title?
        text: "Test" #$scope.title
        className: "h4"
        css:
          width: "500px"
          textAlign: "center"
      title:
        enable: true
        text: "Write Your Title"
        className: "h4"
        css:
          width: "500px",
          textAlign: "center"
      tooltip:
        valueFormatter: (d) ->
          pct   = Math.round((d / $scope.total) * 100)
          "#{pct}%"
        keyFormatter: (d) ->
          d
    }, {}
