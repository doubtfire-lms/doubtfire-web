angular.module('doubtfire.tasks.partials.task-status-summary-stats', [])
.directive('taskStatusSummaryStats', ->
  replace: false
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-status-summary-stats.tpl.html'
  scope:
    unit: "="
  controller: ($scope, Unit, taskService) ->
    # Required for button press -- shouldn't really have objects directly on
    # the $scope, wrap them in dataModel objects is recommended
    $scope.dataModel = {}
    $scope.depth = 0

    $scope.tasksForSelector = [{ text: '--- Overview ---', seq: -1, id: -1 }]

    _.each $scope.unit.task_definitions, (td) ->
      $scope.tasksForSelector.push {
        text: td.abbreviation + ' - ' + td.name
        id: td.id
        seq: td.seq
      }
    
    $scope.tutorialsForSelector = []

    _.each $scope.unit.tutorials, (t) ->
      $scope.tutorialsForSelector.push {
        text: t.abbreviation + ' - ' + t.tutor_name
        id: t.id
        abbreviation: t.abbreviation
      }

    $scope.tutorialsForSelector.push { text: '--- Overview ---', abbreviation: "ZZZ", id: -1 }


    # Load data if not loaded already
    unless $scope.unit.analytics.taskStatusCountByTutorial?
      Unit.taskStatusCountByTutorial.get {id: $scope.unit.id},
        (response) ->
          delete response.$promise
          delete response.$resolved
          $scope.unit.analytics.taskStatusCountByTutorial = response
          $scope.dataModel.selectedType = 'unit'
          test = $scope.switchToTasksForTutorial()
    else
      $scope.dataModel.selectedType = 'unit'

    $scope.$watch 'dataModel.selectedType', (newValue) ->
      if $scope.depth < 1
        $scope.dataModel.selectedTutorial = null
        $scope.dataModel.selectedTask = null

        $scope.depth = 0
        return unless newValue?
        switch newValue
          when 'unit'
            $scope.data = $scope.reduceDataToOverall()
          when 'tutorial'
            $scope.dataModel.selectedTutorial = $scope.tutorialsForSelector[$scope.tutorialsForSelector.length - 1]
          when 'task'
            $scope.dataModel.selectedTask = $scope.tasksForSelector[0]

    $scope.$watch 'dataModel.selectedTutorial', (newValue) ->
      return unless newValue?
      if newValue.id >= 0
        $scope.depth = 0
        $scope.data = $scope.reduceDataToTutorialWithId(newValue)
      else
        $scope.depth = 1
        $scope.data = $scope.reduceDataToTutorial()
        $scope.overview_keys = _.map $scope.unit.tutorials, (t) ->
          {
            title: t.tutor_name + ' - ' + t.abbreviation
            data: $scope.data[t.id]
            tutorial: t
          }
    $scope.$watch 'dataModel.selectedTask', (newValue) ->
      return unless newValue?
      if newValue.id >= 0
        $scope.depth = 0
        $scope.data = $scope.reduceDataToTaskDefWithId(newValue)
      else
        $scope.depth = 1
        $scope.data = $scope.reduceDataToTaskDef()
        $scope.overview_keys = _.map $scope.unit.task_definitions, (td) ->
          {
            title: "#{td.abbreviation}"
            data: $scope.data[td.id]
            task: td
          }

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

    $scope.switchToTask = (task) ->
      $scope.dataModel.selectedType = 'task'
      $scope.dataModel.selectedTutorial = null
      $scope.dataModel.selectedTask = task

    $scope.switchToTutorial = (tutorial) ->
      $scope.dataModel.selectedType = 'tutorial'
      $scope.dataModel.selectedTask = null
      $scope.dataModel.selectedTutorial = tutorial

    $scope.drillDown = () ->
      switch $scope.dataModel.selectedType
        when 'unit'
          $scope.dataModel.selectedType = 'tutorial'
        when 'tutorial'
          $scope.depth = 2
          $scope.data = $scope.switchToTasksForTutorial()[$scope.dataModel.selectedTutorial.id]
          $scope.overview_keys = _.map $scope.unit.task_definitions, (td) ->
            {
              title: "#{td.abbreviation} - in #{$scope.dataModel.selectedTutorial.abbreviation}"
              data: $scope.data[td.id]
              task: td
            }
        when 'task'
          $scope.depth = 2
          $scope.data = $scope.switchToTutorialsForTask()[$scope.dataModel.selectedTask.id]
          $scope.overview_keys = _.map $scope.unit.tutorials, (t) ->
            {
              title: "#{t.tutor_name} - #{t.abbreviation} - for #{$scope.dataModel.selectedTask.abbreviation}"
              data: $scope.data[t.id]
              tutorial: t
            }

    #
    # Essentially, we kill the tutorials by reducing them out
    #   { task_definition_id: { tutorial_id: { status, num }, tutorial_id: { status, num } ... }
    # becomes
    #   { tutorial_id: { task_definition_id: { status, num }, task_definition_id: { status, num } ... }
    #
    $scope.switchToTasksForTutorial = () ->
      result = {}
      _.each $scope.unit.tutorials, (tutorial) ->
        result[tutorial.id] = {}
        _.each $scope.unit.task_definitions, (td) ->
          result[tutorial.id][td.id] = {}

      _.each $scope.unit.analytics.taskStatusCountByTutorial, (taskDef, taskDefId) ->
        _.each taskDef, (stats, tutorialId) ->
          _.each stats, (value) ->

            result[tutorialId][taskDefId][value.status] = value.num
      result

    #
    # Essentially, we kill the tutorials by reducing them out
    #   { task_definition_id: { tutorial_id: { status, num }, tutorial_id: { status, num } ... }
    # becomes
    #   { task_definition_id: { tutorial_id: { status: num, status: num, ... }, tutorial_id: { status, num } ... }
    #
    $scope.switchToTutorialsForTask = () ->
      result = {}
      _.each $scope.unit.task_definitions, (td) ->
        result[td.id] = {}
        _.each $scope.unit.tutorials, (tutorial) ->
          result[td.id][tutorial.id] = {}

      _.each $scope.unit.analytics.taskStatusCountByTutorial, (taskDef, taskDefId) ->
        _.each taskDef, (stats, tutorialId) ->
          _.each stats, (value, key) ->
            result[taskDefId][tutorialId][value.status] = value.num
      result

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
