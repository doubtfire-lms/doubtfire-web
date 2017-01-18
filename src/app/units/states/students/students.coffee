angular.module('doubtfire.units.states.students', [])
#
# State for convenors and tutors to view students
#
.config(($stateProvider) ->
  $stateProvider.state 'units/students', {
    parent: 'units/index'
    url: '/students'
    templateUrl: "units/states/students/students.tpl.html"
    controller: "UnitStudentsStateCtrl"
    data:
      task: "Student List"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)
.controller("UnitStudentsStateCtrl", ($scope, $state, $filter, $timeout, Project, UnitStudentEnrolmentModal, currentUser, unitService, alertService, taskService, gradeService, analyticsService) ->
  # Filtering
  applyFilters = ->
    filteredStudents = $filter('showStudents')($scope.unit.students, $scope.staffFilter, $scope.tutorName)
    # At this point know the length of all students
    allStudentsLength = filteredStudents.length
    # Apply filter for projects and determine to show CSV button
    filteredStudents = $filter('projectFilter')(filteredStudents, $scope.searchText) if $scope.searchText?.trim().length > 0
    # Paginate and sort
    $scope.filteredStudents = $filter('paginateAndSort')(filteredStudents, $scope.pagination, $scope.tableSort)

  # Pagination values
  $scope.pagination =
    currentPage: 1
    maxSize: 15
    pageSize: 15
    totalSize: null
    show: false
    onChange: applyFilters

  # Initial sort orders
  $scope.tableSort =
    order: 'name'
    reverse: false

  # Staff filter options (convenor should see all)
  $scope.staffFilter = {
    Convenor: 'all',
    Tutor: 'mine'
  }[$scope.unitRole.role]

  # Scope for student name
  $scope.tutorName = currentUser.profile.name

  # Send initial apply filter
  applyFilters()

  # Table sorting
  $scope.sortTableBy = (header) ->
    $scope.tableSort.order = header
    $scope.tableSort.reverse = !$scope.tableSort.reverse
    applyFilters()

  # Changing staff filter reapplies filter
  $scope.staffFilterChanged = applyFilters

  # Changing search text reapplies filter
  $scope.searchTextChanged = applyFilters

  # Expose typeahead data function
  $scope.unitTypeAheadData = unitService.unitTypeAheadData

  # Switches the student's tutorial
  $scope.switchToTutorial = (student, tutorial) ->
    student.switchToTutorial(tutorial)

  # CSV header func
  $scope.getCSVHeader = ->
    result = ['student_code', 'name', 'email', 'portfolio', 'lab']
    angular.forEach(taskService.statusKeys, (key) ->
      result.push(key)
    )
    result

  # CSV data row func
  $scope.getCSVData = ->
    analyticsService.event 'Teacher View - Students Tab', 'Export CSV data'
    filteredStudents = $filter('filter')($filter('showStudents')($scope.unit.students, $scope.staffFilter, $scope.tutorName), $scope.searchText)
    result = []
    angular.forEach(filteredStudents, (student) ->
      row = {}
      row['student_code'] = student.student_id
      row['name'] = student.name
      row['email'] = student.student_email
      row['portfolio'] = student.portfolio_status
      if student.tutorial
        row['lab'] = student.tutorial.abbreviation
      else
        row['lab'] = ""
      angular.forEach(student.task_stats, (stat) ->
        row[stat.key] = stat.value
      )
      result.push row
    )
    result

  # Expose the status labels and classes for the bar stats
  $scope.statusClass = taskService.statusClass
  $scope.statusText = taskService.statusText

  # View a student
  $scope.viewStudent = (student) ->
    analyticsService.event 'Teacher View - Students Tab', 'Viewed Student'
    if $scope.fullscreen
      $scope.activeStudent = student
    else
      $state.go "projects#show", {projectId: student.project_id, unitRole: $scope.assessingUnitRole.id}

  # Sets the flag sorting
  $scope.sortTableByFlag = (flag) ->
    if $scope.tableSort.order == flag
      $scope.tableSort.reverse = !$scope.tableSort.reverse
    else
      $scope.tableSort.order = flag

  # Shows the enrolment modal
  $scope.showEnrolModal = ->
    analyticsService.event 'Teacher View - Students Tab', 'Enrol Student'
    UnitStudentEnrolmentModal.show $scope.unit
)
