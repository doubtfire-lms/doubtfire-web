angular.module('doubtfire.groups.partials.groupset-selector', [])

.directive('groupsetSelector', ->
  replace: true
  restrict: 'E'
  templateUrl: 'groups/partials/templates/groupset-selector.tpl.html'
  # scope:
  #   unit: "="
  #   selectedGroupset: "="
  #   selectedGroup: "="

  controller: ($scope) ->
    $scope.status = {
      isopen: false
    }

    $scope.toggleDropdown = ($event) ->
      $event.preventDefault()
      $event.stopPropagation()
      $scope.status.isopen = !$scope.status.isopen

    $scope.selectGroupSet = (gs) ->
      $scope.selectedGroup = null
      $scope.selectedGroupset = gs
      $scope.$digest #notify
      $scope.status.isopen = false
    
    if $scope.unit.group_sets.length > 0
      $scope.selectGroupSet($scope.unit.group_sets[0])
)
