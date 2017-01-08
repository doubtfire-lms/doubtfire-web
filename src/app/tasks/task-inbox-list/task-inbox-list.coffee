angular.module('doubtfire.tasks.task-inbox-list', [])
#
# View a list of tasks in inbox
#
.directive('taskInboxList', ->
  restrict: 'E'
  templateUrl: 'tasks/task-inbox-list/task-inbox-list.tpl.html'
  scope:
    unit: '='
    unitRole: '='
    # Special taskData object
    taskData: '='
  controller: ($scope, taskService, alertService, currentUser, groupService) ->
    # Cleanup
    listeners = []
    $scope.$on '$destroy', -> _.each(listeners, (l) -> l())
    $scope.onSelectedTaskChange = $scope.onSelectedTaskChange() if $scope.onSelectedTaskChange?
    # Check taskSource exists
    unless $scope.taskData?.source?
      throw Error "Invalid taskData.source provided for task inbox list; supply one of Unit.tasksForTaskInbox or Unit.tasksRequiringFeedback"
    # Search option filters
    $scope.showSearchOpts = false
    $scope.statusClass = taskService.statusClass
    $scope.filters = {
      studentName: null
      tutorialIdSelected: if $scope.unitRole.role == 'Tutor' then 'mine' else 'all'
      tutorials: []
      taskDefinitionIdSelected: null
      taskDefinition: null
    }
    # Tutorial options
    tutorials = $scope.unit.tutorials.concat([
      { id: 'all',  description: 'All tutorials',     abbreviation: '__all'  }
      { id: 'mine', description: 'Just my tutorials', abbreviation: '__mine' }
    ])
    $scope.tutorialScopeOptions = _.map(tutorials, (t) ->
      t.description = $scope.unit.tutorialDescription(t) unless t.description?
      t
    )
    $scope.tutorialIdChanged = ->
      tutorialId = $scope.filters.tutorialIdSelected
      if tutorialId == 'mine'
        $scope.filters.tutorials = $scope.unit.tutorialsForUserId(currentUser.id)
      else if tutorialId == 'all'
        $scope.filters.tutorials = $scope.unit.tutorials
      else
        $scope.filters.tutorials = [$scope.unit.tutorialFromId(tutorialId)]
      $scope.filters.tutorials = _.map $scope.filters.tutorials, 'id'
    $scope.tutorialIdChanged($scope.filters.tutorialIdSelected)
    # Task definition options
    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit) if $scope.unit.group_sets.length > 0
    $scope.taskDefinitionIdChanged = ->
      taskDefId = $scope.filters.taskDefinitionIdSelected
      taskDef = $scope.unit.taskDef(taskDefId) if taskDefId?
      $scope.filters.taskDefinition = taskDef
    $scope.tutorialIdChanged($scope.filters.taskDefinitionIdSelected)
    # Finds a task (or null) given its ID
    findTaskForId = (id) -> _.find($scope.tasks, {id: id})
    # Watch for changes in unit ID
    listeners.push $scope.$watch 'unit.id', (newUnitId, oldUnitId) ->
      return if !newUnitId? || (newUnitId == oldUnitId && $scope.tasks?)
      # Tasks for feedback or tasks for task inbox, depending on the data source
      $scope.taskData.source.query { id: newUnitId },
        (response) ->
          $scope.tasks = $scope.unit.incorporateTasks(response)
          # Load initial set task, either the first in the list of tasks or if
          # provided (URL) selected task id then load actual task in now
          task = findTaskForId($scope.taskData.temporaryTaskId) || _.first($scope.tasks)
          $scope.setSelectedTask(task)
          # For when URL has been manually changed, set the selected task
          # using new array of tasks loaded from the new temporaryTaskId
          listeners.push $scope.$watch 'taskData.temporaryTaskId', (newId, oldId) ->
            return if newId == oldId
            $scope.taskData.selectedTask = findTaskForId(newId)
        (response) ->
          alertService.add("danger", response.data.error, 6000)
    # UI call to change currently selected task
    $scope.setSelectedTask = (task) ->
      # Must call on next cycle
      $scope.taskData.selectedTask = task
      $scope.taskData.onSelectedTaskChange?(task)
    $scope.isSelectedTask = (task) ->
      ($scope.taskData.selectedTask?.id || $scope.taskData.temporaryTaskId) == task.id
)
