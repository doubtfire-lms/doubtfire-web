angular.module('doubtfire.units.states.students', [])
#
# State for convenors and tutors to view students
#
.config(($stateProvider) ->
  $stateProvider.state 'units/students/list', {
    parent: 'units/index'
    url: '/students'
    templateUrl: "units/states/students-list/students-list.tpl.html"
    controller: "UnitStudentsStateCtrl"
    data:
      task: "Student List"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)
.controller("UnitStudentsStateCtrl", ($scope, $state, $filter, $timeout, UnitStudentEnrolmentModal, alertService, newTaskService, gradeService, analyticsService, newUserService) ->
  # Filtering
  applyFilters = ->
    filteredProjects = $filter('showStudents')($scope.unit.students, $scope.staffFilter, $scope.tutor)
    # At this point know the length of all students
    allStudentsLength = filteredProjects.length
    # Apply filter for projects and determine to show CSV button
    filteredProjects = $filter('projectFilter')(filteredProjects, $scope.searchText) if $scope.searchText?.trim().length > 0
    # Paginate and sort
    $scope.filteredProjects = $filter('paginateAndSort')(filteredProjects, $scope.pagination, $scope.tableSort)

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
  $scope.tutor = newUserService.currentUser

  # Send initial apply filter
  applyFilters()

  # Table sorting
  $scope.sortTableBy = (column) ->
    if column == 'flags'
      $scope.showSearchOptions = true
      $timeout(->
        document.querySelector('#students-list .panel-body.search-options .form-group.flag-sort button:first-child').focus()
      , 500)
      $scope.tableSort.reverse = !$scope.tableSort.reverse if $scope.tableSort.order == column
      return
    $scope.tableSort.order = column
    $scope.tableSort.reverse = !$scope.tableSort.reverse
    applyFilters()

  # Changing staff filter reapplies filter
  $scope.staffFilterChanged = (newFilter) ->
    $scope.staffFilter = newFilter
    applyFilters()

  # Changing search text reapplies filter
  $scope.searchTextChanged = applyFilters

  # CSV header func
  $scope.getCSVHeader = ->
    result = ['username', 'name', 'email', 'portfolio']
    if $scope.unit.tutorialStreamsCache.size > 0
      _.each $scope.unit.tutorialStreams, (ts) ->
        result.push ts.abbreviation
    else
      result.push 'tutorial'
    result

  # CSV data row func
  $scope.getCSVData = ->
    filteredProjects = $filter('filter')($filter('showStudents')($scope.unit.students, $scope.staffFilter, $scope.tutor), $scope.searchText)
    result = []
    angular.forEach(filteredProjects, (project) ->
      row = {}
      row['username'] = project.student.username
      row['name'] = project.student.name
      row['email'] = project.student.email
      row['portfolio'] = project.portfolioStatus
      if $scope.unit.tutorialStreamsCache.size > 0
        _.each $scope.unit.tutorialStreams, (ts) ->
          row[ts.abbreviation] = project.tutorialForStream(ts)?.abbreviation || ''
      else
        row['tutorial'] = project.tutorials[0]?.abbreviation || ''
      result.push row
    )
    result

  # Expose the status labels and classes for the bar stats
  $scope.statusClass = newTaskService.statusClass
  $scope.statusText = newTaskService.statusText

  # View a student
  $scope.viewStudent = (student) ->
    $state.go("projects/dashboard", {projectId: student.id, tutor: true, taskAbbr:''})

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
