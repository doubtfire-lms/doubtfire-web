angular.module('doubtfire.common.status-icon', [])

.directive 'statusIcon', ->
  restrict: 'E'
  templateUrl: 'common/partials/templates/status-icon.tpl.html'
  scope:
    status: '='
  controller: ($scope, taskService) ->
    $scope.statusIcon  = (status) -> taskService.statusIcons[status]
    $scope.statusLabel = (status) -> taskService.statusLabels[status]
    $scope.statusClass = (status) -> taskService.statusClass status
