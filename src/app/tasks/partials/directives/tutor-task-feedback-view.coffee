angular.module('doubtfire.tasks.partials.tutor-task-feedback-view',[])

.directive('tutorTaskFeedbackView', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/tutor-task-feedback-view.tpl.html'
  scope:
    unit: "=unit"
    context: "=context"
    assessingUnitRole: "=assessingUnitRole"

  controller: ($scope, $filter, $modal, currentUser, Unit, alertService, gradeService, taskService, analyticsService) ->
    if $scope.context == 'assess'
      $scope.title = "Tasks Requring Feedback"
      $scope.statusFilter = 'ready_to_mark'
      $scope.taskPageSize = 5
      category = 'Teacher View - Feedback Tab'
    else
      $scope.title = "Selected Task"
      $scope.statusFilter = null
      $scope.taskPageSize = 10
      category = 'Teacher View - Tasks Tab'

    $scope.search = ""

    $scope.viewOptions = {
      showPdf: true
      showComments: true
      showClassify: true
    }

    $scope.$watch "viewOptions.showPdf", (newVal, oldVal) ->
      if newVal != oldVal
        analyticsService.event category, "#{if $scope.viewOptions.showPdf then 'Showed' else 'Hid'} submission PDF"

    $scope.$watch "viewOptions.showComments", (newVal, oldVal) ->
      if newVal != oldVal
        analyticsService.event category, "#{if $scope.viewOptions.showComments then 'Showed' else 'Hid'} Comments"

    $scope.$watch "viewOptions.showClassify", (newVal, oldVal) ->
      if newVal != oldVal
        analyticsService.event category, "#{if $scope.viewOptions.showClassify then 'Showed' else 'Hid'} Classify Buttons"

    analyticsService.watchEvent $scope, 'sortOrder', category
    analyticsService.watchEvent $scope, 'statusFilter', category
    analyticsService.watchEvent $scope, 'fullscreen', category, (newVal) -> if newVal then 'Show Fullscreen' else 'Hide Fullscreen'
    analyticsService.watchEvent $scope, 'studentFilter', category
    analyticsService.watchEvent $scope, 'taskCurrentPage', category, 'Selected Page'

    searchObj = (obj, value, searched) ->
      _.some(_.keys(obj), (key) ->
        if _.isObject(obj[key])
          if _.includes(searched, obj[key])
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
      analyticsService.event category, "Selected Task"
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
      analyticsService.event category, 'Selected Task Definition'

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

    $scope.showMarkOfflineModal = ->
      analyticsService.event category, "Showed Offline Modal"
      $modal.open
        controller: 'SubmissionMarkingModal'
        templateUrl: 'units/partials/templates/submission-marking-context.tpl.html'
        resolve:
          unit: -> $scope.unit
)
