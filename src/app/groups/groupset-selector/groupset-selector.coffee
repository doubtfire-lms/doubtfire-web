mod = angular.module('doubtfire.groups.groupset-selector', [])

#
# Directive that can switch context of a specific groupset
#
.directive('groupsetSelector', ->
  restrict: 'E'
  template: require('./groupset-selector.tpl.html')
  replace: true
  # scope:
  #   unit: "="
  #   selectedGroupset: "="
  #   selectedGroup: "="
  controller: ($scope) ->
    $scope.selectGroupSet = (gs) ->
      $scope.selectedGroupset = gs
      $scope.$digest #notify

    if $scope.unit.group_sets.length > 0
      $scope.selectGroupSet($scope.unit.group_sets[0])
)

module.exports = mod.name
