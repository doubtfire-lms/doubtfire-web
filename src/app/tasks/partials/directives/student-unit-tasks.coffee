angular.module('doubtfire.tasks.partials.student-unit-tasks', ['doubtfire.tasks.partials.modals'])

#
# Student Unit Tasks
# - display the tasks associated with a student in a unit
# - shows in a box grid that can be used to update task status
#
.directive('studentUnitTasks', ->
  replace: false
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/student-unit-tasks.tpl.html'
  scope:
    student: "=student"
    project: "=project"
    onChange: "=onChange"
    studentProjectId: "=studentProjectId"
    unit: "=unit"
    assessingUnitRole: "=assessingUnitRole"

  controller: ($scope, $modal, Project, taskService) ->
    # functions from task service
    $scope.statusClass = taskService.statusClass
    $scope.statusText = taskService.statusText

    $scope.taskDisabled = (task) ->
      $scope.unit.taskDef(task.task_definition_id).target_grade > $scope.project.target_grade

    # Prepare the scope with the passed in project - either from resource or from passed in scope
    showProject = () ->
      # Extend the tasks with the task definitions
      # - add in task abbreviation, description, name, and status
      $scope.tasks    = $scope.project.tasks.map (task) ->
        td = $scope.unit.taskDef(task.task_definition_id)
        task.definition = td
        task.task_abbr = td.abbreviation
        task.task_desc = td.description
        task.task_name = td.name
        task.seq = td.seq
        task.due_date = td.target_date
        task.upload_requirements = td.upload_requirements
        task.status_txt = taskService.statusLabels[task.status]
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
          assessingUnitRole: -> $scope.assessingUnitRole,
          onChange: -> $scope.onChange
        }
)