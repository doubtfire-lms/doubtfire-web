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
    # student: "=student"
    project: "=project"
    onChange: "=onChange"
    studentProjectId: "=studentProjectId"
    unit: "=unit"
    onSelect: "=onSelect"
    assessingUnitRole: "=assessingUnitRole"

  controller: ($scope, $modal, taskService, groupService, analyticsService) ->
    analyticsService.event 'Student Project View', "Show Unit Tasks Button List"

    # functions from task service
    $scope.statusClass = taskService.statusClass
    $scope.statusText = taskService.statusText
    $scope.taskDefinition = taskService.taskDefinitionFn($scope.unit)

    $scope.taskDisabled = (task) ->
      $scope.taskDefinition(task).target_grade > $scope.project.target_grade

    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit)

    $scope.hideGroupSetName = $scope.unit.group_sets.length is 0
)
