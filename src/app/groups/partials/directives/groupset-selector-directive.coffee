angular.module('doubtfire.groups.partials.groupset-selector', [])

.directive('groupsetSelector', ->
  restrict: 'E'
  templateUrl: 'groups/partials/templates/groupset-selector.tpl.html'
  # scope:
  #   unit: "="
  #   selectedGroupset: "="
    # selectedGroup: "="

  controller: ($scope) ->
    $scope.selectGroupSet = (gs) ->
      $scope.selectedGroupset = gs
      $scope.$digest #notify

    if $scope.unit.group_sets.length > 0
      $scope.selectGroupSet($scope.unit.group_sets[0])
)
