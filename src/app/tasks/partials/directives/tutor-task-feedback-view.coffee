angular.module('doubtfire.tasks.partials.tutor-task-feedback-view',[])

.directive('tutorTaskFeedbackView', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/tutor-task-feedback-view.tpl.html'
  controller: ($scope, $filter, currentUser, Unit, alertService, gradeService, taskService) ->
    $scope.search = ""
    $scope.tutorName = currentUser.profile.name
    $scope.studentFilter = 'myStudents' # Mine by default

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15

    # Initially not full screen
    $scope.fullscreen = false

    $scope.refreshed = false

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