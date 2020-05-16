angular.module('doubtfire.visualisations.student-task-status-bar-chart', [])
.directive 'studentTaskStatusBarChart', ->
  replace: true
  restrict: 'E'
  templateUrl: 'visualisations/visualisation.tpl.html'
  scope:
    project: '='
  controller: ($scope, Visualisation, projectService, gradeService, taskService) ->

    # Sets new filteredTasks variable
    applyFilters = ->
      filteredTasks = projectService.gradedTasks($scope.project)
      $scope.filteredTasks = filteredTasks
    # Apply filters first-time
    applyFilters()
    
    # When refreshing tasks, we are just reloading the active tasks
    $scope.refreshTasks = applyFilters

    $scope.updateData = ->
      $scope.data = []
      $scope.values = []
      _.each $scope.filteredTasks, (task) ->
        $scope.values.push([task.definition.name, (task.quality_pts * 100) / task.definition.max_quality_pts])
      $scope.data.push {key: 'Task Name',bar: true, values: $scope.values}

    $scope.$on 'TaskStatusUpdated', $scope.updateData
    $scope.updateData()

    if $scope.api?
      $scope.api.update()

    # at this stage we have graded tasks:
    xFn = (d) -> d[0]
    yFn = (d) -> d[1]

    console.log $scope.data
    [$scope.options, $scope.config] = Visualisation 'multiBarChart', 'Graded Tasks', {
      stacked: no
      height: 200
      duration: 500
      x: (d) -> d[0]
      y: (d) -> d[1]
      showYAxis: yes
      showValues: true
      xAxis: {
      axisLabel: "Task Name"
      rotateLabels: 30
      showMaxMin: false
      }
      yAxis: {
      axisLabel: "Mark 100%"
      axisLabelDistance: -5
      }
    }, {}