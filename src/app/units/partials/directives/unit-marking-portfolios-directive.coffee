angular.module('doubtfire.units.partials.unit-marking-portfolios-directive', [])

#
# Marking portfolio context
#

.directive('portfolioMarkingContext', ->
  restrict: 'E'
  templateUrl: 'units/partials/templates/portfolio-marking-context.tpl.html'
  controller: ($scope, Unit, analyticsService, gradeService, projectService, unitService, currentUser) ->
    $scope.portfolioDownloadUrl = Unit.getPortfoliosUrl $scope.unit

    $scope.studentFilter = 'myStudents' # Mine by default

    $scope.grades = gradeService.grades
    $scope.unitService = unitService

    $scope.tutorName = currentUser.profile.name

    $scope.search = ""

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15

    $scope.filterOptions = {selectedGrade: 0}
    $scope.grades = gradeService.grades
    $scope.gradeAcronyms = gradeService.gradeAcronyms

    # Initially not full screen
    $scope.fullscreen = false

    $scope.selectedStudent = null

    $scope.gradeResults = [
      {
        name: 'Fail',
        scores: [ 0, 10, 20, 30, 40, 44 ]
      }
      {
        name: 'Pass',
        scores: [ 50, 53, 55, 57 ]
      }
      {
        name: 'Credit',
        scores: [ 60, 63, 65, 67 ]
      }
      {
        name: 'Distinction',
        scores: [ 70, 73, 75, 77 ]
      }
      {
        name: 'High Distinction',
        scores: [ 80, 83, 85, 87 ]
      }
      {
        name: 'High Distinction',
        scores: [ 90, 93, 95, 97, 100 ]
      }
    ]

    $scope.editingRationale = false

    $scope.toggleEditRationale = ->
      $scope.editingRationale = !$scope.editingRationale


    analyticsService.watchEvent $scope, 'studentFilter', 'Teacher View - Grading Tab'
    analyticsService.watchEvent $scope, 'sortOrder', 'Teacher View - Grading Tab'
    analyticsService.watchEvent $scope, 'currentPage', 'Teacher View - Grading Tab', 'Selected Page'
    analyticsService.watchEvent $scope, 'fullscreen', 'Teacher View - Grading Tab', (newVal) -> if newVal then 'Show Fullscreen' else 'Hide Fullscreen'

    $scope.selectStudent = (student) ->
      $scope.selectedStudent = student
      $scope.project = null
      projectService.fetchDetailsForProject student, $scope.unit, (project) ->
        $scope.project = project
      analyticsService.event 'Teacher View - Grading Tab', 'Selected Student'

)