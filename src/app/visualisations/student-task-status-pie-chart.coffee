angular.module('doubtfire.visualisations.student-task-status-pie-chart', [])
.directive 'studentTaskStatusPieChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/visualisation.tpl.html'
  scope:
    project: '='
    updateData: '=?'
  controller: ($scope, taskService, projectService, Visualisation) ->
    colors = taskService.statusColors
    $scope.data = []

    $scope.updateData = ->
      $scope.data.length = 0
      _.each taskService.statusLabels, (label, key) ->
        count = projectService.tasksByStatus($scope.project, key).length
        $scope.data.push { key: label, y: count, status_key: key }

      if $scope.api
        $scope.api.update()

    $scope.$on 'TaskStatusUpdated', $scope.updateData

    $scope.updateData()

    [$scope.options, $scope.config] = Visualisation 'pieChart', 'Student Task Status Pie Chart', {
      color: (d, i) ->
        colors[d.status_key]
      x: (d) -> d.key
      y: (d) -> d.y
      showLabels: no
      tooltip:
        valueFormatter: (d) ->
          fixed = d.toFixed()
          pct   = Math.round((d / $scope.project.target_tasks().length) * 100)
          task  = if fixed is "1" then "task" else "tasks"
          "#{fixed} #{task} (#{pct}%)"
        keyFormatter: (d) ->
          d
    }, {}
