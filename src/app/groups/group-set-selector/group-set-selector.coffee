angular.module('doubtfire.groups.group-set-selector', [])

#
# Directive that can switch context of a specific group set
#
.directive('groupSetSelector', ->
  restrict: 'E'
  templateUrl: 'groups/group-set-selector/group-set-selector.tpl.html'
  scope:
    unit: '='
    selectedGroupSet: '=ngModel'
    onSelectGroupSet: '=onChange'
  controller: ($scope) ->
    unless $scope.unit?
      throw Error "Unit not supplied to group set selector"
    $scope.selectGroupSet = ->
      $scope.onSelectGroupSet?($scope.selectedGroupSet)
)
