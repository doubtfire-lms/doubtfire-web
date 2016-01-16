angular.module('doubtfire.common.status-icon', [])

.directive 'statusIcon', ->
  restrict: 'E'
  templateUrl: 'common/partials/templates/status-icon.tpl.html'
  scope:
    status: '='
  controller: ($scope, taskService) ->
    $scope.statusIcon  = taskService.statusIcons[$scope.status]
    $scope.statusLabel = taskService.statusLabels[$scope.status]
    $scope.statusClass = taskService.statusClass $scope.status
