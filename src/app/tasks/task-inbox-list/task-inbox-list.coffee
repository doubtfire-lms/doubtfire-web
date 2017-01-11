angular.module('doubtfire.tasks.task-inbox-list', [])
#
# View a list of tasks in inbox
#
.directive('taskInboxList', ->
  restrict: 'E'
  templateUrl: 'tasks/task-inbox-list/task-inbox-list.tpl.html'
  scope:
    # Special taskData object
    taskData: '='
    unit: '='
    unitRole: '='
    filters: '=?'
    showSearchOptions: '=?'
    getNextTask: '=?'
    getPreviousTask: '=?'
  controller: ($scope, $timeout, $filter, Unit, taskService, alertService, currentUser, groupService) ->
    # Cleanup
    listeners = []
    $scope.$on '$destroy', -> _.each(listeners, (l) -> l())
    $scope.onSelectedTaskChange = $scope.onSelectedTaskChange() if $scope.onSelectedTaskChange?
    # Check taskSource exists
    unless $scope.taskData?.source?
      throw Error "Invalid taskData.source provided for task inbox list; supply one of Unit.tasksForTaskInbox or Unit.tasksRequiringFeedback"
    # Search option filters
    $scope.filteredTasks = []
    $scope.filters = _.extend({
      studentName: null
      tutorialIdSelected: if $scope.unitRole.role == 'Tutor' then 'mine' else 'all'
      tutorials: []
      taskDefinitionIdSelected: null
      taskDefinition: null
    }, $scope.filters)
    # Sets the new filteredTasks variable
    applyFilters = ->
      filteredTasks = $filter('tasksOfTaskDefinition')($scope.tasks, $scope.filters.taskDefinition)
      filteredTasks = $filter('tasksInTutorials')(filteredTasks, $scope.filters.tutorials)
      filteredTasks = $filter('tasksWithStudentName')(filteredTasks, $scope.filters.studentName)
      $scope.filteredTasks = filteredTasks
    # Next/previous task funcs
    $scope.getNextTask = ->
      idx = _.findIndex($scope.filteredTasks, (t) -> $scope.isSelectedTask(t))
      idx = if idx == -1 then 0 else idx + 1
      console.log "The next index is #{idx}"
      $scope.filteredTasks[idx]
    $scope.getPreviousTask = ->
      idx = _.findIndex($scope.filteredTasks, (t) -> $scope.isSelectedTask(t))
      idx = if idx == -1 then 0 else idx - 1
      console.log "The previous index is #{idx}"
      $scope.filteredTasks[idx]
    # Let's call having a source of tasksForDefinition plus having a task definition
    # auto-selected with the search options open task def mode -- i.e., the mode
    # for selecting tasks by task definitions
    $scope.isTaskDefMode = $scope.taskData.source == Unit.tasksForDefinition && $scope.filters?.taskDefinitionIdSelected? && $scope.showSearchOptions?
    openTaskDefs = ->
      # Automatically "open" the task definition select element if in task def mode
      if $scope.isTaskDefMode
        selectEl = document.querySelector('select[ng-model="filters.taskDefinitionIdSelected"]')
        selectEl.size = 10
        selectEl.focus()
    $timeout openTaskDefs
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
      applyFilters()
    $scope.tutorialIdChanged($scope.filters.tutorialIdSelected)
    # Task definition options
    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit) if $scope.unit.group_sets.length > 0
    $scope.taskDefinitionIdChanged = ->
      taskDefId = $scope.filters.taskDefinitionIdSelected
      taskDef = $scope.unit.taskDef(taskDefId) if taskDefId?
      $scope.filters.taskDefinition = taskDef
      refreshData() if $scope.isTaskDefMode
      applyFilters()
    $scope.tutorialIdChanged($scope.filters.taskDefinitionIdSelected)
    # Student Name options
    $scope.studentNameChanged = ->
      applyFilters()
    # Finds a task (or null) given its task key
    findTaskForTaskKey = (key) -> _.find($scope.tasks, (t) -> t.hasTaskKey(key))
    # Callback to refresh data from the task source
    refreshData = ->
      # Tasks for feedback or tasks for task inbox, depending on the data source
      $scope.taskData.source.query { id: $scope.unit.id, task_def_id: $scope.filters.taskDefinitionIdSelected },
        (response) ->
          $scope.tasks = $scope.unit.incorporateTasks(response)
          # If loading via task definitions, fill
          if $scope.isTaskDefMode
            unstartedTasks = $scope.unit.fillWithUnStartedTasks($scope.tasks, $scope.filters.taskDefinitionIdSelected)
            _.extend($scope.tasks, unstartedTasks)
          # Apply initial filters
          applyFilters()
          # Load initial set task, either the one provided (by the URL)
          # then load actual task in now or the first task that applies
          # to the given set of filters.
          task = findTaskForTaskKey($scope.taskData.taskKey) || _.first($scope.filteredTasks)
          $timeout((-> $scope.setSelectedTask(task)), 500)
          # For when URL has been manually changed, set the selected task
          # using new array of tasks loaded from the new taskKey
          listeners.push $scope.$watch 'taskData.taskKey', (newKey, oldKey) ->
            return if _.isEqual(newKey, oldKey) || !newKey?
            $scope.setSelectedTask(findTaskForTaskKey(newKey))
        (response) ->
          alertService.add("danger", response.data.error, 6000)
    # Watch for changes in unit ID
    listeners.push $scope.$watch 'unit.id', (newUnitId, oldUnitId) ->
      return if !newUnitId? || (newUnitId == oldUnitId && $scope.tasks?)
      refreshData()
    # UI call to change currently selected task
    $scope.setSelectedTask = (task) ->
      $scope.taskData.selectedTask = task
      $scope.taskData.onSelectedTaskChange?(task)
      scrollToTaskInList(task)
    scrollToTaskInList = (task) ->
      taskEl = document.querySelector("task-inbox-list ##{task.taskKeyToIdString()}")
      return unless taskEl?
      funcName = if taskEl.scrollIntoViewIfNeeded? then 'scrollIntoViewIfNeeded' else if taskEl.scrollIntoView? then 'scrollIntoView'
      return unless funcName?
      taskEl[funcName]({behavior: 'smooth', block: 'top'})
    $scope.isSelectedTask = (task) ->
      # Non-null tasks
      if task.id != null
        # Compare ID directly
        ($scope.taskData.selectedTask?.id || $scope.taskData.taskKey) == task.id
      else
        # Compare project IDs (based on student)
        $scope.taskData.selectedTask?.project().project_id == task.project().project_id
)
