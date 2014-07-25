
update_task_stats = (stats_array, new_stats_str) ->
  for i, value of new_stats_str.split("|")
    stats_array[i].value = 100 * value

angular.module('doubtfire.units.partials.contexts', ['doubtfire.units.partials.modals'])

.filter('startFrom', ->
  (input, start) ->
    start = +start # parse to int
    if input
      input.slice(start)
    else
      input
)
#
# Student Unit Tasks
# - display the tasks associated with a student in a unit
# - shows in a box grid that can be used to update task status
#
.directive('studentUnitTasks', ->
  replace: false
  restrict: 'E'
  templateUrl: 'units/partials/templates/student-unit-tasks.tpl.html'
  scope:
    student: "=student"
    project: "=project"
    onChange: "=onChange"
    studentProjectId: "=studentProjectId"
    taskDef: "=taskDef"
    unit: "=unit"
    assessingUnitRole: "=assessingUnitRole"

  controller: ($scope, $modal, Project) ->
    # This function gets the status CSS class for the indicated status
    $scope.statusClass = (status) -> _.trim(_.dasherize(status))
    
    # This function gets the status text for the indicated status
    $scope.statusText = (status) -> statusLabels[status]

    # Prepare the scope with the passed in project - either from resource or from passed in scope
    showProject = () ->
      # Extend the tasks with the task definitions
      # - add in task abbreviation, description, name, and status
      $scope.tasks    = $scope.project.tasks.map (task) ->
        td = $scope.taskDef(task.task_definition_id)[0]
        task.task_abbr = td.abbr
        task.task_desc = td.desc
        task.task_name = td.name
        task.status_txt = statusLabels[task.status]
        task

    updateChart = false
    # Get the Project associated with the student's project id
    if $scope.project
      showProject()
      updateChart = true
    else
      Project.get { id: $scope.studentProjectId }, (project) ->
        $scope.project  = project
        showProject()

    # Show the status update dialog for the indicated task
    $scope.showAssessTaskModal = (task) ->
      $modal.open
        controller: 'AssessTaskModalCtrl'
        templateUrl: 'tasks/partials/templates/assess-task-modal.tpl.html'
        resolve: {
          task: -> task,
          student: -> $scope.student,
          project: -> $scope.project,
          assessingUnitRole: -> $scope.assessingUnitRole
          onChange: -> $scope.onChange
        }
)

.directive('studentUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/student-unit-context.tpl.html'
  controller: ($scope, $rootScope, UnitRole) ->
    #CHECK: rootScope use here?
    if $rootScope.assessingUnitRole? && $rootScope.assessingUnitRole.unit_id == $scope.unitRole.unit_id
      $scope.assessingUnitRole = $rootScope.assessingUnitRole
      $scope.showBack = true
    else
      $scope.assessingUnitRole = $scope.unitRole
      $scope.showBack = false
)

.directive('tutorUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/tutor-unit-context.tpl.html'
  controller: ($scope, $rootScope, $modal, Project, Students, filterFilter, alertService) ->
    # We need to ensure that we have a height for the lazy loaded accordion contents
    $scope.accordionHeight = 100
    # Accordion ready is used to show the accordions
    $scope.accordionReady = false
    # The following is called when the unit is loaded
    prepAccordion = () ->
      # 5 tasks per row, each 32 pixels in size
      $scope.accordionHeight = $scope.taskCount() / 5 * 32
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
    $scope.statusClass = (status) -> _.trim(_.dasherize(status))
    $scope.barLargerZero = (bar) -> bar.value > 0

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15
    # $scope.pageChanged = () ->
    #   console.log('Page changed to: ' + $scope.currentPage)
    # $scope.setPage = (pageNo) ->
    #   $scope.currentPage = pageNo

    Students.query { unit_id: $scope.unitRole.unit_id }, (students) ->
      # extend the students with their tutorial data
      $scope.students = students.map (student) ->
        student.open = false
        student.tutorial = $scope.tutorialFromId( student.tute )[0]
        student.task_stats = [
          { value: 0, type: _.trim(_.dasherize(statusKeys[0]))},
          { value: 0, type: _.trim(_.dasherize(statusKeys[1]))},
          { value: 0, type: _.trim(_.dasherize(statusKeys[2]))},
          { value: 0, type: _.trim(_.dasherize(statusKeys[3]))},
          { value: 0, type: _.trim(_.dasherize(statusKeys[4]))},
          { value: 0, type: _.trim(_.dasherize(statusKeys[5]))},
          { value: 0, type: _.trim(_.dasherize(statusKeys[6]))},
          { value: 0, type: _.trim(_.dasherize(statusKeys[7]))},
          { value: 0, type: _.trim(_.dasherize(statusKeys[8]))},
          { value: 0, type: _.trim(_.dasherize(statusKeys[9]))}
        ]
        update_task_stats(student.task_stats, student.stats)
        student

    update_project_details = (student, project) ->
      update_task_stats(student.task_stats, project.stats)
      if student.project
        _.each student.project.tasks, (task) =>
          task.status = _.where(project.tasks, { task_definition_id: task.task_definition_id })[0].status
      alertService.add("success", "Status updated.", 2000)

    $scope.transitionWeekEnd = (student) ->
      Project.update({ id: student.project_id, trigger: "trigger_week_end" }).$promise.then (
        (project) ->
          update_project_details(student, project)
      )

    #CHECK: rootScope use here?
    # The assessingUnitRole is accessed in student views loaded from this view
    $scope.assessingUnitRole = $scope.unitRole

    # Project.query { unit_role_id: $scope.unitRole.id }, (projects) ->
    #   $scope.projects  = projects.map (project) ->
    #     # extend the tasks with the task definitions
    #     project.tasks    = project.tasks.map (task) ->
    #       td = $scope.taskDef(task.task_definition_id)[0]
    #       task.task_abbr = td.abbr
    #       task.task_desc = td.desc
    #       task.task_name = td.name
    #       task.status_txt = statusLabels[task.status]
    #       task
    #     project

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
  controller: ($scope, $rootScope, TaskCSV, Unit) ->
    $scope.fileUploader = TaskCSV.fileUploader $scope

    $scope.submitUpload = () ->
      $scope.fileUploader.uploadTaskCSV($scope.unit)
    
    $scope.requestExport = () ->
      TaskCSV.downloadFile($scope.unit)
)
.directive('adminUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-admin-context.tpl.html'
  controller: ($scope, $state, $rootScope, Unit) ->
    $scope.format = 'yyyy-MM-dd'
    $scope.initDate = new Date('2016-04-20')
    $scope.startOpened = $scope.endOpened = $scope.opened = false
    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    }

    $scope.saveUnit = ->
      delete $scope.unit[convenors]
      Unit.create { id: $scope.unit.id, unit: $scope.unit } if $scope.unit.id == -1
      Unit.update { id: $scope.unit.id, unit: $scope.unit} if $scope.unit.id != -1
      $state.transitionTo('admin/units#index')

    $scope.open = ($event,which) ->
      $event.preventDefault()
      $event.stopPropagation()
      $scope.opened = !$scope.opened
      $scope.startOpened = !$scope.startOpened if which == 'start'
      $scope.endOpened = !$scope.endOpened if which == 'end'
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
        }
    $scope.createTutorial = ->
      tutorial = { create: true }
      $modal.open
        controller: 'TutorialModalCtrl'
        templateUrl: 'units/partials/templates/tutorial-modal.tpl.html'
        resolve: {
          tutorial: -> null
          isNew: -> true
        }

)
