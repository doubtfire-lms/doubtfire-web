update_task_stats = (stats_array, new_stats_str) ->
  for i, value of new_stats_str.split("|")
    stats_array[i].value = 100 * value

angular.module('doubtfire.units.partials.contexts', [])

.filter('startFrom', ->
  (input, start) ->
    start = +start # parse to int
    if input
      input.slice(start)
    else
      input
)

.directive('myLazyLoad', ->
  transclude: 'element',
  priority: 1200, # changed needed for 1.2
  terminal: true,
  restrict: 'A',
  compile: (element, attr, linker) ->
    (scope, iterStartElement, attr) ->
      hasBeenShown = false
      unwatchFn = scope.$watch(attr.myLazyLoad, (value) ->
        if ( value && !hasBeenShown )
          hasBeenShown = true
          linker(scope, (clone) ->
            iterStartElement.after(clone)
          )
          unwatchFn()
      )
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
  scope: {
    student: "=student",
    studentProjectId: "=studentProjectId",
    taskDef: "=taskDef",
    unit: "=unit",
  }

  controller: ($scope, $modal, Project) ->
    # $scope.accordionHeight = 150

    # Get the Project associated with the student's project id
    Project.get { id: $scope.studentProjectId }, (project) ->
      $scope.project  = project
      # Extend the tasks with the task definitions
      # - add in task abbreviation, description, name, and status
      $scope.tasks    = $scope.project.tasks.map (task) ->
        td = $scope.taskDef(task.task_definition_id)[0]
        task.task_abbr = td.abbr
        task.task_desc = td.desc
        task.task_name = td.name
        task.status_txt = statusLabels[task.status]
        task

      # $scope.accordionHeight = $scope.tasks.count / 6 * 32

      # This function gets the status CSS class for the indicated status
      $scope.statusClass = (status) -> _.trim(_.dasherize(status))
      # This function gets the status text for the indicated status
      $scope.statusText = (status) -> statusLabels[status]

    # Show the status update dialog for the indicated task
    $scope.showAssessTaskModal = (task) ->
      $modal.open
        controller: 'AssessTaskModalCtrl'
        templateUrl: 'tasks/partials/templates/assess-task-modal.tpl.html'
        resolve: {
          task: -> task,
          student: -> $scope.student,
          assessingUnitRole: -> $scope.assessingUnitRole
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
  controller: ($scope, $rootScope, Project, Students, filterFilter) ->
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

    #CHECK: rootScope use here?
    # The assessingUnitRole is accessed in student views loaded from this view
    $rootScope.assessingUnitRole = $scope.unitRole

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


)