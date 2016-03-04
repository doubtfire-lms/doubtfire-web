angular.module('doubtfire.units.partials.unit-tutor-student-list', [])

#
# The Tutor Student List view shows a list of students, with
# their tasks and progress.
#
.directive('tutorStudentList', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/tutor-student-list.tpl.html'
  scope:
    unitRole: "=unitRole"
    unit: "=unit"
    unitLoaded: "=unitLoaded"
    fullscreen: '=?'

  controller: ($scope, $rootScope, $modal, $state, Project, $filter, currentUser, alertService, unitService, taskService, projectService, gradeService, analyticsService) ->
    $scope.studentFilter = 'myStudents' # Mine by default

    $scope.grades = gradeService.grades
    $scope.unitService = unitService

    $scope.tutorName = currentUser.profile.name

    $scope.search = ""

    $scope.$watch 'unit.students', (newUnit) ->
      filteredStudents = $filter('showStudents')($scope.unit.students, 'myStudents', $scope.tutorName)
      if filteredStudents? && filteredStudents.length == 0
        $scope.studentFilter = 'allStudents'

    analyticsService.watchEvent $scope, 'studentFilter', 'Teacher View - Students Tab'
    analyticsService.watchEvent $scope, 'sortOrder', 'Teacher View - Students Tab'
    analyticsService.watchEvent $scope, 'currentPage', 'Teacher View - Students Tab', 'Selected Page'
    analyticsService.watchEvent $scope, 'fullscreen', 'Teacher View - Students Tab', (newVal) -> if newVal then 'Show Fullscreen' else 'Hide Fullscreen'

    $scope.switchToLab = (student, tutorial) ->
      if tutorial
        newId = tutorial.id
      else
        newId = -1
      analyticsService.event 'Teacher View - Students Tab', 'Changed Student Tutorial'
      Project.update({ id: student.project_id, tutorial_id: newId }).$promise.then (
        (project) ->
          student.tutorial_id = project.tutorial_id
          student.tutorial = $scope.unit.tutorialFromId( student.tutorial_id )
      )

    $scope.getCSVHeader = () ->
      result = ['student_code', 'name', 'email', 'portfolio', 'lab']
      angular.forEach(taskService.statusKeys, (key) ->
        result.push(key)
      )
      result

    $scope.getCSVData = () ->
      analyticsService.event 'Teacher View - Students Tab', 'Export CSV data'
      filteredStudents = $filter('filter')($filter('showStudents')($scope.unit.students, $scope.studentFilter, $scope.tutorName), $scope.search)
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
          row[stat.type] = stat.value
        )
        result.push row
      )
      result

    #
    # View a student
    #
    $scope.viewStudent = (student) ->
      analyticsService.event 'Teacher View - Students Tab', 'Viewed Student'
      if $scope.fullscreen
        $scope.activeStudent = student
      else
        $state.go "projects#show", {projectId: student.project_id, unitRole: $scope.assessingUnitRole.id}

    $scope.setFlagSort = (flag) ->
      if $scope.sortOrder is flag
        $scope.reverse = not $scope.reverse
      else
        $scope.sortOrder = flag

    $scope.reverse = false
    $scope.statusClass = taskService.statusClass
    $scope.statusName = (status) ->
      taskService.statusLabels[status.replace(/\-/g, '_')]

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15

    # Initially not full screen
    $scope.fullscreen = false

    update_project_details = (project, response) ->
      projectService.updateTaskStats(project, response.stats)
      if project.tasks
        _.each project.tasks, (task) =>
          task.status = _.filter(response.tasks, { task_definition_id: task.task_definition_id })[0].status
      alertService.add("success", "Status updated.", 2000)

    $scope.transitionWeekEnd = (project) ->
      analyticsService.event 'Teacher View - Students Tab', 'Trigger Week End'
      Project.update({ id: project.project_id, trigger: "trigger_week_end" }
        (response) ->
          update_project_details(project, response)
        (response) ->
          alertService.add("danger", response.data.error, 6000)
      )

    # The assessingUnitRole is accessed in student views loaded from this view
    $scope.assessingUnitRole = $scope.unitRole

    $scope.showEnrolModal = () ->
      analyticsService.event 'Teacher View - Students Tab', 'Enrol Student'
      $modal.open
        templateUrl: 'units/partials/templates/enrol-student-modal.tpl.html'
        controller: 'EnrolStudentModalCtrl'
        resolve:
          unit: -> $scope.unit
)
