angular.module('doubtfire.units.partials.contexts', ['doubtfire.units.partials.modals', 'doubtfire.grade-service'])

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
    studentFilter: "=studentFilter"
    unitLoaded: "=unitLoaded"

  controller: ($scope, $rootScope, $modal, Project, $filter, currentUser, alertService, unitService, taskService, projectService) ->
    # We need to ensure that we have a height for the lazy loaded accordion contents
    $scope.accordionHeight = 100
    # Accordion ready is used to show the accordions
    $scope.accordionReady = false
    $scope.unitService = unitService

    $scope.tutorName = currentUser.profile.name

    $scope.search = ""

    $scope.getCSVHeader = () ->
      result = ['student_code', 'name', 'email', 'lab']
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

    # The following is called when the unit is loaded
    prepAccordion = () ->
      # 5 tasks per row, each 32 pixels in size
      $scope.accordionHeight = $scope.unit.taskCount() / 3 * 28 + 30
      $scope.accordionReady = true
    
    if ! $scope.unitLoaded
      unwatchFn = $scope.$watch( ( () -> $scope.unitLoaded ), (value) ->
        if ( value )
          prepAccordion()
          unwatchFn()
        else
          $scope.accordionReady = false
      )
    else
      prepAccordion()
  
    $scope.reverse = false
    $scope.statusClass = taskService.statusClass
    $scope.barLargerZero = (bar) -> bar.value > 0

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15

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
          projects: -> $scope.students
)

.directive('staffAdminUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/staff-admin-context.tpl.html'
  controller: ($scope, $rootScope, Unit, UnitRole) ->
    temp = []
    users = []

    $scope.changeRole = (unitRole, role_id) ->
      unitRole.role_id = role_id
      unitRole.unit_id = $scope.unit.id
      UnitRole.update { id: unitRole.id, unit_role: unitRole }

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
)
.directive('taskAdminUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/task-admin-context.tpl.html'
  controller: ($scope, $modal, $rootScope, TaskCSV, Unit, gradeService) ->
    $scope.tasksFileUploader = TaskCSV.fileUploader $scope

    $scope.grades = gradeService.grades

    $scope.submitTasksUpload = () ->
      $scope.tasksFileUploader.uploadTaskCSV($scope.unit)
    
    $scope.requestTasksExport = () ->
      TaskCSV.downloadFile($scope.unit)
    
    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15
    
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
    $scope.createTask = ->
      task = { target_date: new Date(), required: true, upload_requirements: [] }
      $modal.open
        controller: 'TaskEditModalCtrl'
        templateUrl: 'units/partials/templates/task-edit-modal.tpl.html'
        resolve: {
          task: -> task
          isNew: -> true
          unit: -> $scope.unit
        }
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
        Unit.create { unit: $scope.unit }, (unit) ->
          $scope.saveSuccess(unit)
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
  controller: ($scope, StudentEnrolmentCSV, Project, alertService) ->
    # TODO: limit scope for duplicate method names (i.e., $scope.requestExport
    # in this scope vs. $scope.requestExport in Task Admin Unit Context)
    $scope.seFileUploader = StudentEnrolmentCSV.fileUploader $scope

    $scope.submitSEUpload = () ->
      $scope.seFileUploader.uploadStudentEnrolmentCSV($scope.unit)
    
    $scope.requestSEExport = () ->
      StudentEnrolmentCSV.downloadFile($scope.unit)

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
  controller: ($scope, TutorMarker) ->
    $scope.dropper = true
    
    $scope.markingFileUploader =
      TutorMarker.fileUploader($scope)

    $scope.submitMarkingUpload = () ->
      $scope.markingFileUploader.uploadZip()
    
    $scope.requestMarkingExport = () ->
      TutorMarker.downloadFile($scope.unit)

    $scope.isMac = () ->
      navigator.platform == "MacIntel"
)
