angular.module('doubtfire.units.states.analytics.directives.task-status-stats', [])

#
# Stats directive that shows the status of tasks throughout
# an entire unit, which can be broken down into a specific
# task or tutorial
#
.directive('taskStatusStats', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/analytics/directives/task-status-stats/task-status-stats.tpl.html'
  scope:
    unit: "="
  controller: ($scope, $filter, Unit, taskService) ->
    # Required for button press -- shouldn't really have objects directly on
    # the $scope, wrap them in dataModel objects is recommended
    $scope.dataModel = {}
    $scope.depth = 0

    $scope.overviewSelectors =
      task:     { text: 'Overview of tasks',     seq: -1,             id: -1 }
      tutorial: { text: 'Overview of tutorials', abbreviation: "ZZZ", id: -1 }
    $scope.tasksForSelector = [$scope.overviewSelectors.task]

    _.each $scope.unit.task_definitions, (td) ->
      $scope.tasksForSelector.push {
        text: td.abbreviation + ' - ' + td.name
        id: td.id
        seq: td.seq
        abbreviation: td.abbreviation
        name: td.name
      }

    $scope.tutorialsForSelector = []

    _.each $scope.unit.tutorials, (t) ->
      $scope.tutorialsForSelector.push {
        text: t.abbreviation + ' - ' + t.tutor.name
        id: t.id
        meeting_time: t.meeting_time
        tutor_name: t.tutor.name
        abbreviation: t.abbreviation
      }

    $scope.tutorialsForSelector.push $scope.overviewSelectors.tutorial


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

    # Set userChange to false to stop code based changes to selected tutorial/task
    # updating the view.
    userChange = true
    userChangeType = true

    $scope.$watch 'dataModel.selectedType', (newValue) ->
      unless userChangeType
        userChangeType = true
        return
      $scope.dataModel.selectedTutorial = null
      $scope.dataModel.selectedTask = null

      $scope.depth = 0
      return unless newValue?
      switch newValue
        when 'unit'
          $scope.data = $scope.reduceDataToOverall()
        when 'tutorial'
          $scope.dataModel.selectedTutorial = $scope.overviewSelectors.tutorial
        when 'task'
          $scope.dataModel.selectedTask = $scope.overviewSelectors.task

    $scope.$watch 'dataModel.selectedTutorial', (newValue) ->
      return unless newValue?
      unless userChange
        userChange = true
        return
      if newValue.id >= 0
        $scope.depth = 0
        $scope.data = $scope.reduceDataToTutorialWithId(newValue)
      else
        $scope.depth = 1
        $scope.data = $scope.reduceDataToTutorial()
        $scope.overviewKeys = _.map $scope.unit.tutorials, (t) ->
          {
            subtitle: "#{t.tutor.name} at #{$filter('date')(t.meeting_time, 'shortTime')}"
            title: t.abbreviation
            data: $scope.data[t.id]
            show: _.keys($scope.data[t.id]).length > 0
            tutorial: t
          }

    $scope.$watch 'dataModel.selectedTask', (newValue) ->
      return unless newValue?
      unless userChange
        userChange = true
        return
      if newValue.id >= 0
        $scope.depth = 0
        $scope.data = $scope.reduceDataToTaskDefWithId(newValue)
      else
        $scope.depth = 1
        $scope.data = $scope.reduceDataToTaskDef()
        $scope.overviewKeys = _.map $scope.unit.task_definitions, (td) ->
          {
            title: td.abbreviation
            subtitle: td.name
            data: $scope.data[td.id]
            show: _.keys($scope.data[td.id]).length > 0
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

    $scope.drillToTask = (task) ->
      if $scope.depth == 0 || $scope.depth == 2
        userChangeType = false
        userChange = $scope.depth == 2 # trigger focus on task if depth 2
        $scope.dataModel.selectedType = 'task'
        $scope.dataModel.selectedTutorial = null
        $scope.dataModel.selectedTask = task
      else
        userChangeType = userChange = false
        $scope.drillDown(task)

    $scope.drillToTutorial = (tutorial) ->
      if $scope.depth == 0 || $scope.depth == 2
        userChangeType = false
        userChange = $scope.depth == 2 # trigger focus on tutorial if depth 2
        $scope.dataModel.selectedType = 'tutorial'
        $scope.dataModel.selectedTask = null
        $scope.dataModel.selectedTutorial = tutorial
      else
        userChangeType = userChange = false
        $scope.drillDown(tutorial)

    $scope.drillDown = (focus) ->
      switch $scope.dataModel.selectedType
        when 'unit'
          $scope.dataModel.selectedType = 'tutorial'
        when 'tutorial'
          $scope.depth = 2
          if focus?
            $scope.dataModel.selectedTutorial = focus
            target = focus
          else
            target = $scope.dataModel.selectedTutorial
          $scope.data = $scope.switchToTasksForTutorial()[target.id]
          $scope.overviewKeys = _.map $scope.unit.task_definitions, (td) ->
            {
              data: $scope.data[td.id]
              show: _.keys($scope.data[td.id]).length > 0
              task: td
              title: td.abbreviation
              subtitle: td.name
            }
        when 'task'
          $scope.depth = 2
          if focus?
            $scope.dataModel.selectedTask = focus
            target = focus
          else
            target = $scope.dataModel.selectedTask
          $scope.data = $scope.switchToTutorialsForTask()[target.id]
          $scope.overviewKeys = _.map $scope.unit.tutorials, (t) ->
            {
              data: $scope.data[t.id]
              show: _.keys($scope.data[t.id]).length > 0
              tutorial: t
              title: t.abbreviation
              subtitle: "#{t.tutor.name} at #{$filter('date')(t.meeting_time, 'shortTime')}"
            }

    $scope.resetToOverview = ->
      switch $scope.dataModel.selectedType
        when 'unit'
          return
        when 'tutorial'
          $scope.dataModel.selectedTutorial = $scope.overviewSelectors.tutorial
        when 'task'
          $scope.dataModel.selectedTask = $scope.overviewSelectors.task
       drillDown()

    #
    # Essentially, we kill the tutorials by reducing them out
    #   { task_definition_id: { tutorial_id: { status, num }, tutorial_id: { status, num } ... }
    # becomes
    #   { tutorial_id: { task_definition_id: { status, num }, task_definition_id: { status, num } ... }
    #
    $scope.switchToTasksForTutorial = ->
      result = {}
      result[''] = {}
      _.each $scope.unit.task_definitions, (td) ->
        result[''][td.id] = {}

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
    $scope.switchToTutorialsForTask = ->
      result = {}
      _.each $scope.unit.task_definitions, (td) ->
        result[td.id] = {}
        _.each $scope.unit.tutorials, (tutorial) ->
          result[td.id][tutorial.id] = {}
        result[td.id][''] = {}

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
            # Grab out all the tutorials and flatten them, group by status
            _.chain(taskDef).values()
            .flatten()
            .groupBy('status')
            # With each status grouped
            .map( (value, status) ->
              # Calculate the sum of the 'num' field in each status
              sumOfStatuses = _.chain(value)
                              .map( (value) -> value.num )
                              .reduce(((memo, num) -> memo + num), 0)
                              .value()
              [status, sumOfStatuses]
            )
            .fromPairs()
            .value()
          [taskDefId, statusesForThisTaskDefId]
        )
        .fromPairs()
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
