mod = angular.module('doubtfire.tasks.project-tasks-list', [])

#
# Displays the tasks associated with a student's project which
# when a task is clicked will automatically jump to the task viewer
# of the task that was clicked
#
.directive('projectTasksList', ->
  replace: true
  restrict: 'E'
  template: require('./project-tasks-list.tpl.html')
  scope:
    unit: "="
    project: "="
    onSelect: "="
    inMenu: '@'

  controller: ($scope, $uibModal, taskService, groupService, analyticsService) ->
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

module.exports = mod.name
