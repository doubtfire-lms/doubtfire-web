angular.module('doubtfire.tasks.task-inbox-list', [])
#
# View a list of tasks in inbox
#
.directive('taskInboxList', ->
  restrict: 'E'
  templateUrl: 'tasks/task-inbox-list/task-inbox-list.tpl.html'
  scope:
    selectedTask: '='
    unit: '='
    unitRole: '='
    # The source from which data comes from, either Unit.tasksForTaskInbox
    # or Unit.tasksRequiringFeedback
    taskSource: '='
  controller: ($scope, taskService, alertService, currentUser, groupService) ->
    $scope.showSearchOpts = false
    return unless _.isFunction($scope.taskSource)
      throw Error "Invalid task source for task inbox list; supply one of Unit.tasksForTaskInbox or Unit.tasksRequiringFeedback"
    # Search option filters
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
    # Tasks for feedback or tasks for task inbox, depending on the data source
    $scope.$watch 'unit.id', (newUnitId) ->
      return unless newUnitId?
      $scope.taskSource.query { id: newUnitId },
        (response) ->
          $scope.tasks = $scope.unit.incorporateTasks(response)
          # Was provided selected task id? Load it now
          if $scope.selectedTask?.id?
            task = _.find($scope.tasks, {id: $scope.selectedTask.id})
            $scope.setSelectedTask(task)
        (response) ->
          alertService.add("danger", response.data.error, 6000)
    # Selected task
    $scope.setSelectedTask = (task) ->
      $scope.selectedTask = task
      $scope.$emit('TaskInboxSelectedTaskChanged', { selectedTask: task })
    $scope.statusClass = taskService.statusClass
)
