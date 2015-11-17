angular.module('doubtfire.tasks.partials.tutor-task-feedback-view',[])

.directive('tutorTaskFeedbackView', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/tutor-task-feedback-view.tpl.html'
  controller: ($scope, $filter, currentUser, Unit, alertService, gradeService, taskService) ->
    $scope.search = ""

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
    $scope.taskPageSize = 5

    # Initially not full screen
    $scope.fullscreen = false

    $scope.refreshed = false

    $scope.activeTask = null

    $scope.viewTask = (task) ->
      $scope.activeTask = task

    $scope.$watch 'unit.students', (newUnit) ->
      filteredStudents = $filter('showStudents')($scope.unit.students, 'myStudents', $scope.tutorName)
      if filteredStudents? && filteredStudents.length == 0
        $scope.studentFilter = 'allStudents'

    $scope.tasksForFeedback = []

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

)