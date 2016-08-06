
#
# Shows a summary of task states as a scatter plot
#
mod = angular.module('doubtfire.tasks.stats.task-summary-stats', [])

.directive('taskSummaryStats', ->
  replace: true
  restrict: 'E'
  template: require('./task-summary-stats.tpl.html')
  scope:
    unit: "=unit"

  controller: ($scope, $uibModal, Task, taskService, TaskCompletionCsv) ->
    # functions from task service
    $scope.statusClass = taskService.statusClass
    $scope.statusText = taskService.statusText

    $scope.headerRow = taskService.allStatusData()

    $scope.scatterData = []

    taskIDs = _.map($scope.unit.task_definitions, (td) -> td.id)

    indexOfTask = (task_definition_id) ->
      _.indexOf taskIDs, task_definition_id
    indexOfTutorial = (tutorialId) ->
      _.indexOf $scope.unit.tutorials, _.find( $scope.unit.tutorials, (tutorial) -> tutorial.id == tutorialId )

    angular.forEach $scope.unit.tutorials, (tute) ->
      tutorial = { key: tute.abbreviation }

    numStudents = 0

    $scope.countClass = (count) ->
      if numStudents == 0 then ''
      else if count / numStudents > 0.5 then 'warning'
      else if count / numStudents > 0.25 then 'info'
      else ''

    $scope.fetchCSV = () ->
      TaskCompletionCsv.downloadFile($scope.unit)

    $scope.fetchStats = () ->
      numStudents = $scope.unit.students.length
      if numStudents == 0
        return

      # clear tmpScatterData
      tmpScatterData = []

      updateTask = (task_definition_id, status, tutorialId) ->
        tutorialIdx = indexOfTutorial(tutorialId)
        taskIdx = indexOfTask(task_definition_id)
        statusIdx = taskService.indexOf(status)

        tmpScatterData[tutorialIdx][statusIdx][taskIdx] += 1
        tmpScatterData[tutorialIdx][0][taskIdx] -= 1  #remove one from not-started


      angular.forEach $scope.unit.tutorials, (tute) ->
        tutorialData = []

        angular.forEach taskService.statusKeys, (sk) ->
          col = []
          angular.forEach $scope.unit.task_definitions, (td) ->
            if sk == taskService.statusKeys[0]
              col.push tute.num_students #not started has all student initially
            else
              col.push 0

          tutorialData.push col
        tmpScatterData.push tutorialData

      # angular.forEach $scope.stats, (row) ->
      #   angular.forEach row.stats, (rs) ->
      #     rs.count = 0
      Task.summaryData.query { unit_id: $scope.unit.id }, (tasks) ->
        angular.forEach tasks, (task) ->
          updateTask(task.task_definition_id, task.status, task.tutorial_id)

        # generate pcts
        _.each tmpScatterData, (tute, tuteIdx) ->
          _.each tute, (row, colIdx) ->
            _.each row, (val, idx) ->
              tmpScatterData[tuteIdx][colIdx][idx] /= numStudents

        # generate graph data
        scatterData = []
        _.each( $scope.unit.tutorials, (tute, tuteIdx) ->
          tutorial = {
            key: tute.abbreviation
            values: []
          }
          _.each tmpScatterData[tuteIdx], (col, statusIdx) ->
            _.each col, (val, taskIdx) ->
              if val > 0
                data = {
                  x: statusIdx + tuteIdx / ($scope.unit.tutorials.length * 2)
                  y: taskIdx
                  size: val
                }
                tutorial.values.push(data)
          scatterData.push(tutorial)
        ) # end each tutorial

        $scope.scatterData = scatterData
    $scope.fetchStats()
)

module.exports = mod.name
