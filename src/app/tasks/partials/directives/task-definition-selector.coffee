angular.module('doubtfire.tasks.partials.task-definition-selector',[])

.directive('taskDefinitionSelector', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-definition-selector.tpl.html'
  scope:
    unit: "="
    onSelectDefinition: "="
    buttonStyle: '@'
  controller: ($scope, groupService) ->
    $scope.buttonStyle = if $scope.buttonStyle? then $scope.buttonStyle else 'primary'
    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit)

    $scope.hideGroupSetName = $scope.unit.group_sets.length is 0

    $scope.selectedDefinition = null

    $scope.setSelectedDefinition = (taskDef) ->
      $scope.selectedDefinition = taskDef
      if $scope.onSelectDefinition? && _.isFunction($scope.onSelectDefinition)
        $scope.onSelectDefinition(taskDef)
)
