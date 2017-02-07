angular.module('doubtfire.common.status-icon', [])

.directive 'statusIcon', ->
  restrict: 'E'
  templateUrl: 'common/status-icon/status-icon.tpl.html'
  scope:
    status: '='
    showTooltip: '@'
  controller: ($scope, taskService) ->
    $scope.showTooltip ?= true
    $scope.statusIcon  = (status) -> taskService.statusIcons[status]
    $scope.statusLabel = (status) -> taskService.statusLabels[status]
    $scope.statusClass = (status) -> taskService.statusClass status
