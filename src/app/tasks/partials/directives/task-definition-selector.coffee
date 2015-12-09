angular.module('doubtfire.tasks.partials.task-definition-selector',[])

.directive('taskDefinitionSelector', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-definition-selector.tpl.html'
  scope:
    unit: "=unit"
    onSelectDefinition: "=onSelectDefinition"
  controller: ($scope, groupService) ->

    $scope.groupSetName = (id) ->
      groupService.groupSetName(id, $scope.unit)

    $scope.selectedDefinition = null

    $scope.setSelectedDefinition = (taskDef) ->
      $scope.selectedDefinition = taskDef
      if $scope.onSelectDefinition? && _.isFunction($scope.onSelectDefinition)
        $scope.onSelectDefinition(taskDef)
)