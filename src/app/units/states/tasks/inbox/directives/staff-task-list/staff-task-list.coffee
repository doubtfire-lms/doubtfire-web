angular.module('doubtfire.units.states.tasks.inbox.directives.staff-task-list', [])
#
# View a list of tasks
#
.directive('staffTaskList', ->
  restrict: 'E'
  templateUrl: 'units/states/tasks/inbox/directives/staff-task-list/staff-task-list.tpl.html'
  scope:
    # Special taskData object
    taskData: '='
    unit: '='
    unitRole: '='
    filters: '=?'
    showSearchOptions: '=?'
  controller: ($scope, $timeout, $filter, $window, Unit, taskService, alertService, currentUser, groupService, listenerService, dateService, projectService, TaskDefinition) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)

    # UI call to change currently selected task
    $scope.setSelectedTask = (task) ->
      $scope.taskData.selectedTask = task
      $scope.taskData.onSelectedTaskChange?(task)
      scrollToTaskInList(task) if task?

    # Check taskSource exists
    unless $scope.taskData?.source?
      throw Error "Invalid taskData.source provided for task list; supply one of Unit.tasksForTaskInbox, Unit.tasksRequiringFeedback, Unit.taskByTaskDefinition"
    # showDate from date-service
    $scope.showDate = dateService.showFullDate
    # Does the current user have any tutorials?
    $scope.userHasTutorials = $scope.unit.tutorialsForUserName(currentUser.profile.name)?.length > 0
    # Search option filters
    $scope.filteredTasks = []
    $scope.filters = _.extend({
      studentName: null
      tutorialIdSelected: if ($scope.unitRole.role == 'Tutor' || 'Convenor') && $scope.userHasTutorials then 'mine' else 'all'
      tutorials: []
      taskDefinitionIdSelected: null
      taskDefinition: null
    }, $scope.filters)

    $scope.refreshTasks = ->
      refreshData()

    # Sets the new filteredTasks variable
    applyFilters = ->
      filteredTasks = $filter('tasksOfTaskDefinition')($scope.tasks, $scope.filters.taskDefinition)
      filteredTasks = $filter('tasksInTutorials')(filteredTasks, $scope.filters.tutorials)
      filteredTasks = $filter('tasksWithStudentName')(filteredTasks, $scope.filters.studentName)
      $scope.filteredTasks = filteredTasks

      # Fix selected task.
      if $scope.taskData.selectedTask && !_.includes(filteredTasks, $scope.taskData.selectedTask)
        $scope.setSelectedTask(null)

    # Let's call having a source of tasksForDefinition plus having a task definition
    # auto-selected with the search options open task def mode -- i.e., the mode
    # for selecting tasks by task definitions
    $scope.isTaskDefMode = $scope.taskData.source == Unit.tasksForDefinition && $scope.filters?.taskDefinitionIdSelected? && $scope.showSearchOptions?
    if $scope.isTaskDefMode
      $scope.submissionsUrl = TaskDefinition.getSubmissionsUrl($scope.unit.id, $scope.filters.taskDefinitionIdSelected)
      $scope.submissionsPdfsUrl = TaskDefinition.getSubmissionsPdfsUrl($scope.unit.id, $scope.filters.taskDefinitionIdSelected)

    openTaskDefs = ->
      # Automatically "open" the task definition select element if in task def mode
      selectEl = document.querySelector('select[ng-model="filters.taskDefinitionIdSelected"]')
      selectEl.size = 10
      selectEl.focus()
    $timeout openTaskDefs if $scope.isTaskDefMode
    # Tutorial options
    $scope.tutorials = _.map($scope.unit.tutorials.concat([
      { id: 'all',  description: 'All tutorials',     abbreviation: '__all'  }
      { id: 'mine', description: 'Just my tutorials', abbreviation: '__mine' }
    ]), (tutorial) ->
      unless _.includes(['all', 'mine'], tutorial.id)
        if tutorial.description.indexOf(tutorial.abbreviation) == -1
          tutorial.description = tutorial.abbreviation + ' - ' + tutorial.description
      tutorial
    )
    $scope.tutorialIdChanged = ->
      tutorialId = $scope.filters.tutorialIdSelected
      if tutorialId == 'mine'
        $scope.filters.tutorials = $scope.unit.tutorialsForUserName(currentUser.profile.name)
      else if tutorialId == 'all'
        # Students not in tutorials but submitting work
        $scope.filters.tutorials = _.concat($scope.unit.tutorials, [{id: null}])
      else
        $scope.filters.tutorials = [$scope.unit.tutorialFromId(tutorialId)]
      $scope.filters.tutorials = _.map($scope.filters.tutorials, 'id')
      applyFilters()
    # Set initial tutorial scope
    $scope.tutorialIdChanged()
    # Task definition options
    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit) if $scope.unit.hasGroupwork()
    $scope.taskDefinitionIdChanged = ->
      $scope.submissionsUrl = TaskDefinition.getSubmissionsUrl($scope.unit.id, $scope.filters.taskDefinitionIdSelected)
      $scope.submissionsPdfsUrl = TaskDefinition.getSubmissionsPdfsUrl($scope.unit.id, $scope.filters.taskDefinitionIdSelected)
      taskDefId = $scope.filters.taskDefinitionIdSelected
      taskDef = $scope.unit.taskDef(taskDefId) if taskDefId?
      $scope.filters.taskDefinition = taskDef
      refreshData() if $scope.isTaskDefMode
      applyFilters()
    # Set new taskDefinitionIdSelected if task def mode and taskDefAbbr set
    setTaskDefFromTaskKey = (taskKey) ->
      # Only applicable in taskDefMode
      return unless $scope.isTaskDefMode
      taskDef = _.find($scope.unit.task_definitions, {abbreviation: taskKey?.taskDefAbbr}) || _.first($scope.unit.task_definitions)
      $scope.filters.taskDefinitionIdSelected = taskDef.id
      $scope.filters.taskDefinition = taskDef
    setTaskDefFromTaskKey($scope.taskData.taskKey)
    # Student Name options
    $scope.studentNameChanged = applyFilters
    # Finds a task (or null) given its task key
    findTaskForTaskKey = (key) -> _.find($scope.tasks, (t) -> t.hasTaskKey(key))
    # Initially not watching the task key
    watchingTaskKey = false
    # Callback to refresh data from the task source
    refreshData = ->
      # Tasks for feedback or tasks for task, depending on the data source
      $scope.taskData.source.query { id: $scope.unit.id, task_def_id: $scope.filters.taskDefinitionIdSelected },
        (response) ->
          $scope.tasks = $scope.unit.incorporateTasks(response, applyFilters)
          # If loading via task definitions, fill
          if $scope.isTaskDefMode
            unstartedTasks = $scope.unit.fillWithUnStartedTasks($scope.tasks, $scope.filters.taskDefinitionIdSelected)
            _.extend($scope.tasks, unstartedTasks)
          # Apply initial filters
          applyFilters()
          # Load initial set task, either the one provided (by the URL)
          # then load actual task in now or the first task that applies
          # to the given set of filters.
          task = findTaskForTaskKey($scope.taskData.taskKey)
          $timeout((-> $scope.setSelectedTask(task)), 500)
          # For when URL has been manually changed, set the selected task
          # using new array of tasks loaded from the new taskKey
          unless watchingTaskKey
            watchingTaskKey = true
            listeners.push $scope.$watch 'taskData.taskKey', (newKey, oldKey) ->
              return if _.isEqual(newKey, oldKey) || !newKey?
              # Task def mode and key assignment change? Reload data with new key
              if $scope.isTaskDefMode && newKey.taskDefAbbr != oldKey?.taskDefAbbr
                setTaskDefFromTaskKey($scope.taskData.taskKey)
                refreshData()
              else
                # Set initial filters if not taskDefMode to set correct task def
                $scope.setSelectedTask(findTaskForTaskKey(newKey))
        (response) ->
          alertService.add("danger", response.data.error, 6000)
    # Watch for changes in unit ID
    listeners.push $scope.$watch 'unit.id', (newUnitId, oldUnitId) ->
      return if !newUnitId? || (newUnitId == oldUnitId && $scope.tasks?)
      refreshData()
    scrollToTaskInList = (task) ->
      taskEl = document.querySelector("staff-task-list ##{task.taskKeyToIdString()}")
      return unless taskEl?
      funcName = if taskEl.scrollIntoViewIfNeeded? then 'scrollIntoViewIfNeeded' else if taskEl.scrollIntoView? then 'scrollIntoView'
      return unless funcName?
      taskEl[funcName]({behavior: 'smooth', block: 'top'})
    $scope.isSelectedTask = (task) ->
      sameProject = $scope.taskData.selectedTask?.project().project_id == task.project().project_id
      sameTaskDef = $scope.taskData.selectedTask?.task_definition_id == task.task_definition_id
      sameProject && sameTaskDef
)
