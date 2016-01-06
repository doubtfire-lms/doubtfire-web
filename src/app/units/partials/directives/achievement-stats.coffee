angular.module('doubtfire.units.partials.achievement-stats', [])
.directive('achievementStats', ->
  replace: false
  restrict: 'E'
  templateUrl: 'units/partials/templates/achievement-stats.tpl.html'
  scope:
    unit: "="
  controller: ($scope, Unit) ->
    mapData = (data) ->
      return unless $scope.unit.analytics?.learningProgressClassDetails?
      data = $scope.unit.analytics.learningProgressClassDetails unless data?
      return unless $scope.dataModel?.selectedType? and data?
      if $scope.dataModel.selectedType is 'unit'
        data['all']
      else
        data = data[$scope.dataModel.selectedTutorial.id]
        delete data.students
        data

    # Load data if not loaded already
    unless $scope.unit.analytics?.learningProgressClassDetails?
      Unit.learningProgressClassDetails.get {id: $scope.unit.id},
        (response) ->
          $scope.unit.analytics.learningProgressClassDetails = response
          $scope.data = mapData()
    else
      $scope.data = mapData()

    $scope.dataModel = {
      selectedType: 'unit',
      selectedTutorial: _.last $scope.unit.tutorials
    }
    $scope.$watch 'dataModel.selectedType', ->
      $scope.data = mapData()
    $scope.$watch 'dataModel.selectedTutorial', ->
      $scope.data = mapData()
)
