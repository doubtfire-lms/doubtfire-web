mod = angular.module('doubtfire.common.status-icon', [])

.directive 'statusIcon', ->
  restrict: 'E'
  template: require('./status-icon.tpl.html')
  scope:
    status: '='
  controller: ($scope, taskService) ->
    $scope.statusIcon  = (status) -> taskService.statusIcons[status]
    $scope.statusLabel = (status) -> taskService.statusLabels[status]
    $scope.statusClass = (status) -> taskService.statusClass status

module.exports = mod.name
