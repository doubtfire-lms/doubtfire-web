_ = require('lodash')

#
# A switch that that the selection of a specified task definition
# Only handles task definition - not tasks in a project
#
mod = angular.module('doubtfire.tasks.task-definition-selector',[])

.directive('taskDefinitionSelector', ->
  replace: true
  restrict: 'E'
  template: require('./task-definition-selector.tpl.html')
  scope:
    # Unit required
    unit: "="
    # What to do when definition is changed
    onSelectDefinition: "="
    # Provide a btn-style to force the colour to change`
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

module.exports = mod.name
