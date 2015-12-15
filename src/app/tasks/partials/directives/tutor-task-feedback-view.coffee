angular.module('doubtfire.tasks.partials.tutor-task-feedback-view',[])

.directive('tutorTaskFeedbackView', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/tutor-task-feedback-view.tpl.html'
  scope:
    unit: "=unit"
    context: "=context"
    assessingUnitRole: "=assessingUnitRole"

  controller: ($scope, $filter, currentUser, Unit, alertService, gradeService, taskService) ->
    if $scope.context == 'assess'
      $scope.title = "Tasks Requring Feedback"
      $scope.statusFilter = 'ready_to_mark'
      $scope.taskPageSize = 5
    else
      $scope.title = "Selected Task"
      $scope.statusFilter = null
      $scope.taskPageSize = 10

    $scope.search = ""

    $scope.viewOptions = {
      showPdf: true
      showComments: true
      showClassify: true
    }

    searchObj = (obj, value, searched) ->
      _.some(_.keys(obj), (key) ->
        if _.isObject(obj[key])
          if _.contains(searched, obj[key])
            return false
          searched.push obj[key]

          if searchObj(obj[key], value, searched)
            return true
          # else go to next key for this obj
        else
          actual = ('' + obj[key]).toLowerCase()
          expected = ('' + value).toLowerCase()

          if actual.indexOf(expected) > -1
            return true
          # else go to next key for this obj
        return false
      )
    $scope.searchIncProject = (item) ->
      if $scope.search.length == 0
        return true
      itemWithProj = _.extend {}, item, { project: item.project() }

      searchObj itemWithProj, $scope.search, []

    $scope.tutorName = currentUser.profile.name
    $scope.studentFilter = 'myStudents' # Mine by default

    # Pagination details
    $scope.taskCurrentPage = 1
    $scope.taskMaxSize = 5

    # Initially not full screen
    $scope.fullscreen = false

    $scope.refreshed = false

    $scope.activeTask = null

    $scope.statusText = taskService.statusText
    $scope.statusData = taskService.statusData
    $scope.statusClass = taskService.statusClass
    $scope.statusIcon = (status) -> taskService.statusIcons[status]

    $scope.viewTask = (task) ->
      $scope.activeTask = task
    
    $scope.onStatusUpdate = (status) ->
      $scope.activeTask = null

    $scope.tasksForFeedback = []

    $scope.selectedDefinition = null

    $scope.refreshTasksForSingleDef = () ->
      $scope.refreshed = false
      return unless $scope.selectedDefinition?
      Unit.tasksForDefinition.query { id: $scope.unit.id, task_def_id: $scope.selectedDefinition.id },
        (response) ->
          $scope.refreshed = true
          $scope.tasksForFeedback.length = 0
          tasks = $scope.unit.incorporateTasks response
          tasks = $scope.unit.fillWithUnStartedTasks tasks, $scope.selectedDefinition

          $scope.tasksForFeedback = _.extend $scope.tasksForFeedback, tasks
        (response) ->
          alertService.add("danger", response.data.error, 6000)


    $scope.onSelectDefinition = (taskDef) ->
      return if taskDef == $scope.selectedDefinition
      $scope.activeTask = null
      $scope.selectedDefinition = taskDef
      $scope.refreshTasksForSingleDef()

    $scope.refreshTasksForFeedback = () ->
      $scope.refreshed = false
      Unit.tasksRequiringFeedback.query { id: $scope.unit.id },
        (response) ->
          $scope.refreshed = true
          $scope.tasksForFeedback.length = 0
          tasks = $scope.unit.incorporateTasks response

          $scope.tasksForFeedback = _.extend $scope.tasksForFeedback, tasks
        (response) ->
          alertService.add("danger", response.data.error, 6000)

    $scope.refreshTasks = () ->
      if $scope.context == 'assess'
        $scope.refreshTasksForFeedback()
      else
        $scope.refreshTasksForSingleDef()

    $scope.$watch 'unit.students', (newUnit) ->
      filteredStudents = $filter('showStudents')($scope.unit.students, 'myStudents', $scope.tutorName)
      if filteredStudents? && filteredStudents.length == 0
        $scope.studentFilter = 'allStudents'
      $scope.refreshTasks()
)