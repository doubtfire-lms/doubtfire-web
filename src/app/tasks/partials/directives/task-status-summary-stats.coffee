angular.module('doubtfire.tasks.partials.task-status-summary-stats', [])
.directive('taskStatusSummaryStats', ->
  replace: false
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-status-summary-stats.tpl.html'
  scope:
    unit: "="
  controller: ($scope, Unit, taskService) ->
    $scope.dataModel = {}

    # Load data if not loaded already
    unless $scope.unit.analytics.taskStatusCountByTutorial?
      Unit.taskStatusCountByTutorial.get {id: $scope.unit.id},
        (response) ->
          delete response.$promise
          delete response.$resolved
          $scope.unit.analytics.taskStatusCountByTutorial = response
          $scope.dataModel.selectedType = 'unit'

    $scope.$watch 'dataModel.selectedType', (newValue) ->
      $scope.dataModel.selectedTutorial = null
      $scope.dataModel.selectedTask = null
      return unless newValue?
      switch newValue
        when 'unit'
          $scope.data = $scope.reduceDataToOverall()
        when 'tutorial'
          $scope.dataModel.selectedTutorial = _.last $scope.unit.tutorials
        when 'task'
          $scope.dataModel.selectedTask = _.first $scope.unit.task_definitions

    $scope.$watch 'dataModel.selectedTutorial', (newValue) ->
      return unless newValue?
      $scope.data = $scope.reduceDataToTutorialWithId(newValue)

    $scope.$watch 'dataModel.selectedTask', (newValue) ->
      return unless newValue?
      $scope.data = $scope.reduceDataToTaskDefWithId(newValue)

    $scope.$watch 'data', (newValue) ->
      return unless newValue?
      total = _ .chain(newValue)
                .values()
                .reduce(((memo, num) -> memo + num), 0)
                .value()
      completedPct = newValue[taskService.acronymKey.COM] / total
      if completedPct? && ! isNaN(completedPct)
        $scope.completeStats = {
          completed:  Math.round(completedPct * 100)
          left:       Math.round((1 - completedPct) * 100)
        }
      else
        $scope.completeStats = {
          completed:  0
          left:       100
        }

    #
    # Essentially, we kill the tutorials by reducing them out
    #   { task_definition_id: { tutorial_id: { status, num }, tutorial_id: { status, num } ... }
    # becomes
    #   { task_definition_id: { status, num }, task_definition_id: { status, num } ... }
    #
    $scope.reduceDataToTaskDef = ->
      # Begin the mapping
      _ .chain($scope.unit.analytics.taskStatusCountByTutorial)
        .map( (taskDef, taskDefId) ->
          # This task def id
          statusesForThisTaskDefId =
            _.chain(taskDef)
             # Grab out all the tutorials and flatten them, group by status
             .values()
             .flatten()
             .groupBy('status')
             # With each status grouped
             .map( (value, status) ->
               # Calculate the sum of the 'num' field in each status
               sumOfStatuses = _.chain(value)
                                .pluck('num')
                                .reduce(((memo, num) -> memo + num), 0)
                                .value()
               [status, sumOfStatuses]
            )
            .object()
            .value()
          [taskDefId, statusesForThisTaskDefId]
        )
        .object()
        .value()

    #
    # Same as above, but gets specific task definition
    #
    $scope.reduceDataToTaskDefWithId = (taskDef) ->
      $scope.reduceDataToTaskDef()[taskDef.id]

    #
    # Kill both the tutorials and the task definitions
    #   { task_definition_id: { tutorial_id: { status, num }, tutorial_id: { status, num } ... }
    # becomes
    #   [ { status, num }, { status, num } ]
    #
    $scope.reduceDataToOverall = ->
      taskDefValues = _.values($scope.reduceDataToTaskDef())
      _.reduce taskDefValues, ((memo, taskDef) ->
        for status of taskDef
          memo[status] = (if status of memo then memo[status] else 0) + taskDef[status]
        memo
      ), {}

    #
    # Kill the task definitions
    #   { task_definition_id: { tutorial_id: { status, num }, tutorial_id: { status, num } ... }
    # becomes
    #   { tutorial_id: { status, num }, tutorial_id: { status, num } ... }
    #
    $scope.reduceDataToTutorial = ->
      data = {}
      for taskDef, tutorialData of $scope.unit.analytics.taskStatusCountByTutorial
        for tutorialId, tutorialStatuses of tutorialData
          data[tutorialId] = {} unless data[tutorialId]?
          for statuses in tutorialStatuses
            data[tutorialId][statuses.status] = 0 unless data[tutorialId][statuses.status]?
            data[tutorialId][statuses.status] += statuses.num
      data

    #
    # Same as above, but gets specific tutorial
    #
    $scope.reduceDataToTutorialWithId = (tutorial) ->
      $scope.reduceDataToTutorial()[tutorial.id]
)
