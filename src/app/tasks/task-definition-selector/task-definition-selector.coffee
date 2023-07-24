angular.module('doubtfire.tasks.task-definition-selector',[])

#
# A switch that that the selection of a specified task definition
# Only handles task definition - not tasks in a project
#
.directive('taskDefinitionSelector', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/task-definition-selector/task-definition-selector.tpl.html'
  scope:
    # Unit required
    unit: "="
    # What to do when definition is changed
    onSelectDefinition: "="
    # Use ng-model to select task
    ngModel: '=?'
    # Provide a btn-style to force the colour to change`
    buttonStyle: '@'
    # Clearable
    showClear: '=?'
  controller: ($scope) ->
    $scope.buttonStyle ?= 'default'
    $scope.groupSetName = (id) ->
      $scope.unit.groupSetsCache.get(id)?.name || "Individual Work"

    $scope.hideGroupSetName = $scope.unit.groupSets?.length is 0

    $scope.selectedDefinition = null

    $scope.setSelectedDefinition = (taskDef) ->
      $scope.selectedDefinition = taskDef
      $scope.ngModel = taskDef
      if $scope.onSelectDefinition? && _.isFunction($scope.onSelectDefinition)
        $scope.onSelectDefinition(taskDef)
)
