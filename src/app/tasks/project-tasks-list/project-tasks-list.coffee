angular.module('doubtfire.tasks.project-tasks-list', [])

#
# Displays the tasks associated with a student's project which
# when a task is clicked will automatically jump to the task viewer
# of the task that was clicked
#
.directive('projectTasksList', ->
  replace: false
  restrict: 'E'
  templateUrl: 'tasks/project-tasks-list/project-tasks-list.tpl.html'
  scope:
    # student: "=student"
    project: "=project"
    onChange: "=onChange"
    studentProjectId: "=studentProjectId"
    unit: "=unit"
    onSelect: "=onSelect"
    assessingUnitRole: "=assessingUnitRole"

  controller: ($scope, $modal, taskService, groupService, analyticsService) ->
    analyticsService.event 'Student Project View', "Showed Task Button List"

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
