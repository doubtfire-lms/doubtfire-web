angular.module('doubtfire.units.partials.contexts', ['doubtfire.units.partials.modals'])

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

  controller: ($scope, $rootScope, $modal, $state, Project, $filter, currentUser, alertService, unitService, taskService, projectService, gradeService) ->
    $scope.studentFilter = 'myStudents' # Mine by default

    $scope.grades = gradeService.grades
    $scope.unitService = unitService

    $scope.tutorName = currentUser.profile.name

    $scope.search = ""

    $scope.switchToLab = (student, tutorial) ->
      if tutorial
        newId = tutorial.id
      else
        newId = -1
      Project.update({ id: student.project_id, tutorial_id: newId }).$promise.then (
        (project) ->
          student.tute = project.tute
          student.tutorial = $scope.unit.tutorialFromId( student.tute )
      )

    $scope.getCSVHeader = () ->
      result = ['student_code', 'name', 'email', 'portfolio', 'lab']
      angular.forEach(projectService.progressKeys, (key) ->
        result.push(key)
      )
      angular.forEach(taskService.statusKeys, (key) ->
        result.push(key)
      )
      result

    $scope.getCSVData = () ->
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
        angular.forEach(student.progress_stats, (stat) ->
          row[stat.type] = stat.value
        )
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
      console.log {projectId: student.project_id, unitRole: $scope.assessingUnitRole.id}
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

    oldCurrentPage = $scope.currentPage
    $scope.$watch 'fullscreen', (newValue) ->
      if newValue
        $scope.pageSize = 9999 # allow infinite scroll
        $scope.currentPage = 1
      else
        $scope.pageSize = 15 # default size
        $scope.currentPage = oldCurrentPage

    update_project_details = (student, project) ->
      projectService.updateTaskStats(student, project.stats)
      if student.project
        _.each student.project.tasks, (task) =>
          task.status = _.where(project.tasks, { task_definition_id: task.task_definition_id })[0].status
      alertService.add("success", "Status updated.", 2000)

    $scope.transitionWeekEnd = (student) ->
      Project.update({ id: student.project_id, trigger: "trigger_week_end" }).$promise.then (
        (project) ->
          update_project_details(student, project)
      )

    # The assessingUnitRole is accessed in student views loaded from this view
    $scope.assessingUnitRole = $scope.unitRole

    $scope.showEnrolModal = () ->
      $modal.open
        templateUrl: 'units/partials/templates/enrol-student-modal.tpl.html'
        controller: 'EnrolStudentModalCtrl'
        resolve:
          unit: -> $scope.unit
)

.directive('staffAdminUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/staff-admin-context.tpl.html'
  controller: ($scope, $rootScope, Unit, UnitRole, alertService, groupService) ->
    temp = []
    users = []

    $scope.changeRole = (unitRole, role_id) ->
      unitRole.role_id = role_id
      unitRole.unit_id = $scope.unit.id
      UnitRole.update { id: unitRole.id, unit_role: unitRole },
        (response) -> alertService.add("success", "Role changed", 2000)
        (response) ->
          alertService.add("danger", response.data.error, 6000)

    $scope.addSelectedStaff = ->
      staff = $scope.selectedStaff
      $scope.selectedStaff = null
      $scope.unit.staff = [] unless $scope.unit.staff
      tutorRole = UnitRole.create { unit_id: $scope.unit.id, user_id: staff.id, role: 'Tutor' }
      $scope.unit.staff.push(tutorRole)

    $scope.findStaffUser = (id) ->
      for staff in $scope.staff
        return staff if staff.id == id

    # Used in the typeahead to filter staff already in unit
    $scope.filterStaff = (staff) ->
      not _.find($scope.unit.staff, (listStaff) -> staff.id == listStaff.user_id)

    $scope.removeStaff = (staff) ->
      $scope.unit.staff = _.without $scope.unit.staff, staff
      UnitRole.delete { id: staff.id }
      staffUser = $scope.findStaffUser(staff.user_id)

    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit)

)
.directive('taskAdminUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/task-admin-context.tpl.html'
  controller: ($scope, $modal, $rootScope, Task, Unit, gradeService, alertService, taskService) ->
    $scope.grades = gradeService.grades

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 7
    $scope.pageSize = 7

    # Modal Events
    $scope.editTask = (task) ->
      $modal.open
        controller: 'TaskEditModalCtrl'
        templateUrl: 'units/partials/templates/task-edit-modal.tpl.html'
        resolve: {
          task: -> task
          isNew: -> false
          unit: -> $scope.unit
        }

    guessTaskAbbreviation = () ->
      unit = $scope.unit
      if unit.task_definitions.length == 0
        "1.1P"
      else
        last_abbr = unit.task_definitions[unit.task_definitions.length-1].abbreviation
        regex = /(.*)(\d+)(\D*)/
        match = regex.exec last_abbr
        if match?
          "#{match[1]}#{parseInt(match[2])+1}#{match[3]}"
        else
          "#{last_abbr}1"


    $scope.createTask = ->
      abbr = guessTaskAbbreviation()
      task = {
        name: "Task #{abbr}",
        abbreviation: abbr,
        description: "New Description",
        target_date: new Date(),
        upload_requirements: [],
        plagiarism_checks: []
        weight: 4
        target_grade: 0
        restrict_status_updates: false
        plagiarism_warn_pct: 80
      }
      $modal.open
        controller: 'TaskEditModalCtrl'
        templateUrl: 'units/partials/templates/task-edit-modal.tpl.html'
        resolve: {
          task: -> task
          isNew: -> true
          unit: -> $scope.unit
        }

    $scope.deleteTask = (task) ->
      taskService.deleteTask(task, $scope.unit)

    $scope.taskFiles = { file: { name: 'Task PDFs', type: 'zip'  } }
    $scope.taskUploadUrl = Unit.taskUploadUrl($scope.unit)

    $scope.onTaskPDFSuccess = (response) ->
      alertService.add("success", "Files uploaded", 2000)
      $scope.filesUploaded = response

    $scope.batchFiles = { file: { name: 'CSV Data', type: 'csv'  } }
    $scope.batchTaskUrl = ->
      Task.getTaskDefinitionBatchUploadUrl($scope.unit)
    $scope.onBatchTaskSuccess = (response) ->
      newTasks = response.added
      updatedTasks = response.updated
      failedTasks = response.failed

      if newTasks.length > 0
        alertService.add("success", "Added #{newTasks.length} tasks.", 2000)
        _.extend($scope.unit.task_definitions, newTasks)
      if updatedTasks.length > 0
        alertService.add("success", "Updated #{updatedTasks.length} tasks.", 2000)
        _.each updatedTasks, (td) ->
          idx = _.findIndex $scope.unit.task_definitions, { 'abbreviation': td.abbreviation }
          if idx >= 0
            _.extend $scope.unit.task_definitions[idx], td
      if failedTasks.length > 0
        alertService.add("danger", "Failed to add #{failedTasks.length} tasks.")

)
.directive('adminUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-admin-context.tpl.html'
  controller: ($scope, $state, $rootScope, Unit, alertService, unitService) ->
    $scope.format = 'yyyy-MM-dd'
    $scope.initDate = new Date('2016-04-20')
    $scope.startOpened = $scope.endOpened = $scope.opened = false
    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    }
    $scope.unitTypeAheadData = unitService.unitTypeAheadData
    $scope.studentSearch = ""

    $scope.saveUnit = ->
      if $scope.unit.convenors then delete $scope.unit.convenors

      if $scope.unit.id == -1
        Unit.create { unit: $scope.unit },
          (unit) ->
            $scope.saveSuccess(unit)
          (response) ->
            alertService.add("danger", response.data.error, 6000)
      else
        Unit.update { id: $scope.unit.id, unit: $scope.unit}, (unit) ->
          alertService.add("success", "Unit updated.", 2000)
          $state.transitionTo('admin/units#index')
)
.directive('tutorialUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/tutorial-admin-context.tpl.html'
  controller: ($scope, $modal, $rootScope, Unit, UnitRole) ->
    $scope.editTutorial = (tutorial) ->
      $modal.open
        controller: 'TutorialModalCtrl'
        templateUrl: 'units/partials/templates/tutorial-modal.tpl.html'
        resolve: {
          tutorial: -> tutorial
          isNew: -> false
          tutors: -> $scope.unit.staff
          unit: -> $scope.unit
        }

    $scope.deleteTutorial = (tutorial) ->
      # TODO: No endpoint for this yet
      alert "Functionality coming soon!"
      $scope.unit.tutorials = _.without $scope.unit.tutorials, tutorial

    $scope.createTutorial = ->
      d = new Date()
      d.setHours(8)
      d.setMinutes(30)

      tutorial = { abbreviation: "LA1-??", meeting_day: "Monday", meeting_time: d, meeting_location: "ATC???" }
      $modal.open
        controller: 'TutorialModalCtrl'
        templateUrl: 'units/partials/templates/tutorial-modal.tpl.html'
        resolve: {
          tutorial: -> tutorial
          isNew: -> true
          tutors: -> $scope.unit.staff
          unit: -> $scope.unit
        }

)
.directive('enrolStudentsContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/enrol-student-context.tpl.html'
  controller: ($scope, $modal, Unit, Project, alertService) ->
    $scope.activeBatchStudentType = 'enrol' # Enrol by default
    $scope.batchStudentTypes =
      enrol:
        batchUrl: -> Unit.enrolStudentsCSVUrl $scope.unit
        batchFiles: { file: { name: 'Enrol CSV Data', type: 'csv'  } }
        onSuccess: onBatchEnrolSuccess
      withdraw:
        batchUrl: -> Unit.withdrawStudentsCSVUrl $scope.unit
        batchFiles: { file: { name: 'Withdraw CSV Data', type: 'csv'  } }
        onSuccess: onBatchWithdrawSuccess

    $scope.showEnrolModal = () ->
      $modal.open
        templateUrl: 'units/partials/templates/enrol-student-modal.tpl.html'
        controller: 'EnrolStudentModalCtrl'
        resolve:
          unit: -> $scope.unit

    onBatchEnrolSuccess = (response) ->
      newStudents = response
      # at least one student?
      if newStudents.length > 0
        alertService.add("success", "Enrolled #{newStudents.length} students.", 2000)
        $scope.unit.students = $scope.unit.students.concat(newStudents)
      else
        alertService.add("info", "No students need to be enrolled.", 4000)

    onBatchWithdrawSuccess = (response) ->
      withdrawnStudents = response
      # at least one student?
      if withdrawnStudents.length > 0
        alertService.add("success", "Withdrew #{withdrawnStudents.length} students.", 2000)
        student.enrolled = false for student in $scope.unit.students when student.student_id in withdrawnStudents
      else
        alertService.add("info", "No students need to be withdrawn.", 4000)

    change_enrolment = (student, value) ->
      Project.update { id: student.project_id, enrolled: value }, (project) ->
        if value == project.enrolled
          alertService.add("success", "Enrolment changed.", 2000)
        else
          alertService.add("danger", "Enrolment change failed.", 5000)
        student.enrolled = project.enrolled

    $scope.withdraw = (student) ->
      change_enrolment(student, false)
    $scope.enrol = (student) ->
      change_enrolment(student, true)

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15
)
.directive('tutorMarkingContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/tutor-marking-context.tpl.html'
  controller: ($scope, $sce) ->
    $scope.activeContext = 'submissions'
    $scope.setActiveContext = (context) ->
      return if context is $scope.activeContext
      $scope.activeContext = context
    $scope.contexts =
      submissions:
        title: 'Mark Submissions Offline'
        subtitle: 'Download student submissions that are Ready to Mark, and upload the marked work here'
        icon: 'file'
      portfolios:
        title: 'Mark Portfolios'
        subtitle: 'Download all submitted portfolios here for marking'
        icon: 'book'
      # potentially tests here too?
)
