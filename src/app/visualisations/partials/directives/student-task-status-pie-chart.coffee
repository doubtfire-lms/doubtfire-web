angular.module('doubtfire.visualisations.student-task-status-pie-chart', [])
.directive 'studentTaskStatusPieChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/partials/templates/visualisation.tpl.html'
  scope:
    project: '='
  controller: ($scope, taskService, projectService, Visualisation) ->
    colors = taskService.statusColors

    updateData = ->
      $scope.data = []
      _.each taskService.statusLabels, (label, key) ->
        count = projectService.tasksByStatus($scope.project, key).length
        $scope.data.push { key: label, y: count, status_key: key }

    $scope.$watch 'project.burndown_chart_data', updateData

    [$scope.options, $scope.config] = Visualisation 'pieChart', {
      color: (d, i) ->
        colors[d.status_key]
      x: (d) -> d.key
      y: (d) -> d.y
      showLabels: no
      tooltip:
        valueFormatter: (d) ->
          fixed = d.toFixed()
          pct   = Math.round((d / $scope.project.tasks.length) * 100)
          task  = if fixed is 1 then "task" else "tasks"
          "#{fixed} #{task} (#{pct}%)"
        keyFormatter: (d) ->
          d
    }, {}
