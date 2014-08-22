angular.module('doubtfire.tasks.partials.task-summary-stats', [])

#
# Task summary stats
# - 2d array of status vs task abbr --> counts
#
.directive('taskSummaryStats', ->
  replace: false
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-summary-stats.tpl.html'
  scope:
    unit: "=unit"

  controller: ($scope, $modal, Task, taskService) ->
    # functions from task service
    $scope.statusClass = taskService.statusClass
    $scope.statusText = taskService.statusText

    $scope.headerRow = taskService.allStatusData()

    $scope.stats = []

    angular.forEach $scope.unit.task_definitions, (td) ->
      row = {}
      row.stats = taskService.allStatusData() #get a dict with all status in it
      row.task = td.abbr
      angular.forEach row.stats, (rs) ->
        rs.count = 0
      $scope.stats.push(row)

    numStudents = 0
    $scope.countClass = (count) ->
      if numStudents == 0 then ''
      else if count / numStudents > 0.5 then 'warning'
      else if count / numStudents > 0.25 then 'info'
      else ''

    updateTask = (abbr, status) ->
      _.find($scope.stats, (stat) -> abbr == stat.task).stats[taskService.indexOf(status)].count += 1

    $scope.fetchStats = () ->
      numStudents = $scope.unit.students.length

      angular.forEach $scope.stats, (row) ->
        angular.forEach row.stats, (rs) ->
          rs.count = 0
      Task.query { unit_id: $scope.unit.id }, (tasks) ->
        angular.forEach tasks, (task) ->
          updateTask(task.task_abbr, task.status)
)