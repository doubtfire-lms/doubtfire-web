angular.module('doubtfire.units.states.analytics.directives.unit-achievement-stats', [])

#
# Student's overall achievement statistics over the entire unit
#
.directive('unitAchievementStats', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/analytics/directives/unit-achievement-stats/unit-achievement-stats.tpl.html'
  scope:
    unit: "="
  controller: ($scope, Unit) ->
    # Load data if not loaded already
    unless $scope.unit.analytics?.learningProgressClassDetails?
      Unit.learningProgressClassDetails.get {id: $scope.unit.id},
        (response) ->
          $scope.unit.analytics.learningProgressClassDetails = response
          $scope.data = response.all
    else
      $scope.data = $scope.unit.analytics.learningProgressClassDetails.all

    $scope.depth = 0

    $scope.switchToTutorial = (tutorial) ->
      return unless $scope.unit.analytics?.learningProgressClassDetails?
      $scope.dataModel.selectedTutorial = tutorial
      if tutorial is overviewTutorial
        rawData = _.clone $scope.unit.analytics.learningProgressClassDetails
        delete rawData.all
        delete rawData.$promise
        delete rawData.$resolved
        $scope.data = rawData
        $scope.depth = 1
      else
        $scope.data = $scope.unit.analytics.learningProgressClassDetails[tutorial.id]
        $scope.depth = 0
      $scope.data = _.chain($scope.data).map( (d, id) ->
        delete d.students
        [id, d]
      ).fromPairs().value()

    $scope.drillDown = ->
      $scope.dataModel.selectedType = 'tutorial'
      $scope.switchToTutorial(overviewTutorial)

    $scope.dataModel = {
      selectedType: 'unit'
      selectedTutorial: overviewTutorial
      pct: true
    }

    overviewTutorial = {
      id: -1
      abbreviation: 'Overview'
      tutor_name: 'All Tutorials'
    }

    $scope.tutorialsForSelector = [overviewTutorial].concat($scope.unit.tutorials)

    $scope.$watch 'dataModel.selectedType', (newValue) ->
      return unless $scope.unit.analytics?.learningProgressClassDetails?
      if newValue is 'tutorial'
        $scope.switchToTutorial(overviewTutorial)
      else
        $scope.depth = 0
        $scope.data = $scope.unit.analytics.learningProgressClassDetails.all

    $scope.$watch 'dataModel.selectedTutorial', $scope.switchToTutorial
)
