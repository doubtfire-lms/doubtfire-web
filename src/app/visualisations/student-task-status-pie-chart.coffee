angular.module('doubtfire.visualisations.student-task-status-pie-chart', [])
.directive 'studentTaskStatusPieChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/visualisation.tpl.html'
  scope:
    project: '='
    updateData: '=?'
  controller: ($scope, newTaskService, Visualisation) ->
    colors = newTaskService.statusColors
    $scope.data = []

    $scope.updateData = ->
      $scope.data.length = 0
      newTaskService.statusLabels.forEach( (label, key) ->
        count = $scope.project.tasksByStatus(key).length
        $scope.data.push { key: label, y: count, statusKey: key }
      )

      if $scope.api
        $scope.api.update()

    $scope.$on 'TaskStatusUpdated', $scope.updateData

    $scope.updateData()

    [$scope.options, $scope.config] = Visualisation 'pieChart', 'Student Task Status Pie Chart', {
      color: (d, i) ->
        colors.get(d.statusKey)
      x: (d) -> d.key
      y: (d) -> d.y
      showLabels: no
      tooltip:
        valueFormatter: (d) ->
          fixed = d.toFixed()
          pct   = Math.round((d / $scope.project.activeTasks().length) * 100)
          task  = if fixed is "1" then "task" else "tasks"
          "#{fixed} #{task} (#{pct}%)"
        keyFormatter: (d) ->
          d
    }, {}
