mod = angular.module('doubtfire.units.unit-student-portfolio-list', [])

#
# List of all students who have portfolios and provides a marking
# context for those portfolios
#
.directive('unitStudentPortfolioList', ->
  restrict: 'E'
  template: require('./unit-student-portfolio-list.tpl.html')
  controller: ($scope, Unit, analyticsService, gradeService, projectService, unitService, currentUser) ->
    $scope.portfolioDownloadUrl = Unit.getPortfoliosUrl $scope.unit
    $scope.gradeDownloadUrl = Unit.getGradesUrl $scope.unit

    $scope.studentFilter = 'allStudents'

    #
    # Sets the active tab
    #
    $scope.setActiveTab = (tab) ->
      # Do nothing if we're switching to the same tab
      return if tab is $scope.activeTab
      $scope.activeTab?.active = false
      $scope.activeTab = tab
      $scope.activeTab.active = true

    #
    # Active task tab group
    #
    $scope.gradingTabs =
      selectStudent:
        title: "Select Student"
        subtitle: "Select the student to assess"
        icon: "fa-hand-o-right"
        seq: 0
        active: false
      viewProgress:
        title: "View Progress"
        subtitle: "See the progress of the student"
        icon: "fa-line-chart"
        seq: 1
        active: false
      viewPortfolio:
        title: "View Portfolio"
        subtitle: "See the portfolio of the student"
        icon: "fa-book"
        seq: 2
        active: false
      assessPortfolio:
        title: "Assess Portfolio"
        subtitle: "Enter a grade for the student"
        icon: "fa-trophy"
        seq: 3
        active: false

    $scope.setActiveTab($scope.gradingTabs.selectStudent)

    $scope.grades = gradeService.grades
    $scope.unitService = unitService

    $scope.tutorName = currentUser.profile.name

    $scope.search = ""

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 5

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

module.exports = mod.name
