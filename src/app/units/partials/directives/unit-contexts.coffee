angular.module('doubtfire.units.partials.contexts', ['doubtfire.units.partials.modals'])

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

      if staff.id?
        tutorRole = UnitRole.create { unit_id: $scope.unit.id, user_id: staff.id, role: 'Tutor' },
          (response) -> $scope.unit.staff.push(tutorRole)
          (response) ->
            alertService.add('danger', "Unable to add staff member. #{response.data.error}", 6000)
      else
        alertService.add('danger', "Unable to add staff member. Ensure they have a tutor or convenor account in User admin first.", 6000)

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
  controller: ($scope, $rootScope, Task, Unit, gradeService, alertService, taskService, csvResultService) ->
    $scope.grades = gradeService.grades

    # Pagination details
    $scope.taskAdminPager = {
      currentPage: 1
      maxSize: 5
      pageSize: 5

      search: ''
      sortOrder: 'seq'
      reverse: false
    }

    $scope.taskAdminData = {
      selectedTask: null
      isNew: false
    }

    # Modal Events
    $scope.editTask = (task) ->
      $scope.taskAdminData.selectedTask = task
      $scope.taskAdminData.isNew = false

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
        start_date: new Date(),
        target_date: new Date(),
        upload_requirements: [],
        plagiarism_checks: []
        weight: 4
        target_grade: 0
        restrict_status_updates: false
        plagiarism_warn_pct: 80
      }
      $scope.taskAdminData.selectedTask = task
      $scope.taskAdminData.isNew = true

    # Watch for deletion
    $scope.$watch 'unit.task_definitions.length', (newLength, oldLength) ->
      # Return if equal
      return if newLength == oldLength

      if $scope.unit.task_definitions.length > 0
        # Delete
        if newLength < oldLength
          $scope.editTask _.first $scope.unit.task_definitions
        else
          $scope.editTask _.last $scope.unit.task_definitions
      else
        $scope.taskAdminData.selectedTask = null

    $scope.taskFiles = { file: { name: 'Task PDFs', type: 'zip'  } }
    $scope.taskUploadUrl = Unit.taskUploadUrl($scope.unit)

    $scope.onTaskPDFSuccess = (response) ->
      alertService.add("success", "Files uploaded", 2000)
      $scope.filesUploaded = response

    $scope.batchFiles = { file: { name: 'CSV Data', type: 'csv'  } }
    $scope.batchTaskUrl = ->
      Task.getTaskDefinitionBatchUploadUrl($scope.unit)
    $scope.onBatchTaskSuccess = (response) ->
      csvResultService.show "Task CSV Upload Results", response
      if response.success.length > 0
        $scope.unit.refresh()

)
.directive('adminUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-admin-context.tpl.html'
  controller: ($scope, $state, $rootScope, Unit, alertService, unitService) ->
    $scope.format = 'yyyy-MM-dd'
    $scope.initDate = new Date('2016-04-20')

    $scope.calOptions = {
      startOpened: false
      endOpened: false
    }

    # Datepicker opener
    $scope.open = ($event, pickerData) ->
      $event.preventDefault()
      $event.stopPropagation()

      if pickerData == 'start'
        $scope.calOptions.startOpened = ! $scope.calOptions.startOpened
        $scope.calOptions.endOpened = false
      else
        $scope.calOptions.startOpened = false
        $scope.calOptions.endOpened = ! $scope.calOptions.endOpened

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
        if $scope.unit.start_date && $scope.unit.start_date.getMonth
          $scope.unit.start_date = "#{$scope.unit.start_date.getFullYear()}-#{$scope.unit.start_date.getMonth() + 1}-#{$scope.unit.start_date.getDate()}"
        if $scope.unit.end_date && $scope.unit.end_date.getMonth
          $scope.unit.end_date = "#{$scope.unit.end_date.getFullYear()}-#{$scope.unit.end_date.getMonth() + 1}-#{$scope.unit.end_date.getDate()}"
        Unit.update(
          {
            id: $scope.unit.id
            unit: {
              name: $scope.unit.name
              code: $scope.unit.code
              description: $scope.unit.description
              start_date: $scope.unit.start_date
              end_date: $scope.unit.end_date
              active: $scope.unit.active
            }
          }, (unit) ->
            alertService.add("success", "Unit updated.", 2000)
          (response) ->
            alertService.add("danger", "Failed to update unit. #{response.error}", 6000)
        )
)
.directive('tutorialUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/tutorial-admin-context.tpl.html'
  controller: ($scope, $modal, $rootScope, Unit, UnitRole, Tutorial, alertService) ->
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
      Tutorial.delete { id: tutorial.id },
        (response) ->
          $scope.unit.tutorials = _.without $scope.unit.tutorials, tutorial
          alertService.add("info", "Tutorial #{tutorial.abbreviation} was deleted successfully")
        (response) ->
          alertService.add("danger", response.data.error)

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
  controller: ($scope, $modal, Unit, Project, alertService, csvResultService) ->
    $scope.activeBatchStudentType = 'enrol' # Enrol by default

    $scope.showEnrolModal = () ->
      $modal.open
        templateUrl: 'units/partials/templates/enrol-student-modal.tpl.html'
        controller: 'EnrolStudentModalCtrl'
        resolve:
          unit: -> $scope.unit

    onBatchEnrolSuccess = (response) ->
      newStudents = response
      # at least one student?
      csvResultService.show("Enrol Student CSV Results", response)
      if response.success.length > 0
        $scope.unit.refreshStudents()

    onBatchWithdrawSuccess = (response) ->
      csvResultService.show("Withdraw Student CSV Results", response)
      if response.success.length > 0
        alertService.add("success", "Withdrew #{response.success.length} students.", 2000)
        $scope.unit.refreshStudents()
      else
        alertService.add("info", "No students need to be withdrawn.", 4000)

    $scope.batchStudentTypes =
      enrol:
        batchUrl: -> Unit.enrolStudentsCSVUrl $scope.unit
        batchFiles: { file: { name: 'Enrol CSV Data', type: 'csv'  } }
        onSuccess: onBatchEnrolSuccess
      withdraw:
        batchUrl: -> Unit.withdrawStudentsCSVUrl $scope.unit
        batchFiles: { file: { name: 'Withdraw CSV Data', type: 'csv'  } }
        onSuccess: onBatchWithdrawSuccess

    change_enrolment = (student, value) ->
      Project.update { id: student.project_id, enrolled: value },
        (project) ->
          if value == project.enrolled
            alertService.add("success", "Enrolment changed.", 2000)
          else
            alertService.add("danger", "Enrolment change failed.", 5000)
          student.enrolled = project.enrolled
        (response) ->
          alertService.add("danger", response.data.error, 5000)

    $scope.withdraw = (student) ->
      change_enrolment(student, false)
    $scope.enrol = (student) ->
      change_enrolment(student, true)

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15
)
# .directive('tutorMarkingContext', ->
#   replace: true
#   restrict: 'E'
#   templateUrl: 'units/partials/templates/tutor-marking-context.tpl.html'
#   controller: ($scope, $sce, $stateParams) ->
#     $scope.activeContext = 'submissions'
#     $scope.assessingUnitRole = $stateParams.unitRole
#     $scope.setActiveContext = (context) ->
#       return if context is $scope.activeContext
#       $scope.activeContext = context
#     $scope.contexts =
#       submissions:
#         title: 'Mark Submissions Offline'
#         subtitle: 'Download student submissions that are Ready to Mark, and upload the marked work here'
#         icon: 'file'
#       portfolios:
#         title: 'Mark Portfolios'
#         subtitle: 'Download all submitted portfolios here for marking'
#         icon: 'book'
#       # potentially tests here too?
# )
