angular.module('doubtfire.tasks.partials.target-grade-stats', [])
.directive('targetGradeStats', ->
  replace: false
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/target-grade-stats.tpl.html'
  scope:
    unit: "="
  controller: ($scope, Unit, taskService) ->
    # Required for button press -- shouldn't really have objects directly on
    # the $scope, wrap them in dataModel objects is recommended
    $scope.dataModel = {}

    # Load data if not loaded already
    unless $scope.unit.analytics.targetGradeStats?
      Unit.targetGradeStats.query {id: $scope.unit.id},
        (response) ->
          delete response.$promise
          delete response.$resolved
          $scope.unit.analytics.targetGradeStats = response
          $scope.dataModel.selectedType = 'unit'
    else
      $scope.dataModel.selectedType = 'unit'

    $scope.$watch 'dataModel.selectedType', (newValue) ->
      $scope.dataModel.selectedTutorial = null
      $scope.dataModel.selectedTask = null
      return unless newValue?
      switch newValue
        when 'unit'
          $scope.data = $scope.reduceDataToOverall()
        when 'tutorial'
          $scope.dataModel.selectedTutorial = _.last $scope.unit.tutorials

    $scope.$watch 'dataModel.selectedTutorial', (newValue) ->
      return unless newValue?
      $scope.data = $scope.reduceDataToTutorialWithId(newValue)

    #
    # Kill both the tutorials and reduce them down
    #   [ { tutorial_id, target, num }, { tutorial_id, target, num } ... }
    # becomes
    #   [ { target, num }, { target, num } ]
    #
    $scope.reduceDataToOverall = ->
      _ .chain($scope.unit.analytics.targetGradeStats)
        .groupBy('grade')
        .map( (gradeInfo, gradeId) ->
          totalForThisGrade = _ .chain(gradeInfo)
                                .pluck('num')
                                .reduce(( (memo, num) -> num + memo ), 0)
                                .value()
          [gradeId, totalForThisGrade]
        )
        .object()
        .value()

    #
    # Group by tutorial_id
    #   [ { tutorial_id, target, num }, { tutorial_id, target, num } ... }
    # becomes
    #   { tutorial_id: { target, num }, tutorial_id: { target, num } ... }
    #
    $scope.reduceDataToTutorial = ->
      _ .chain($scope.unit.analytics.targetGradeStats)
        .groupBy('tutorial_id')
        .map( (tutorialInfo, tutorialId) ->
          gradeInfo = _ .chain(tutorialInfo)
                        .map((gradeInfo) -> [gradeInfo.grade, gradeInfo.num])
                        .object()
                        .value()
          [tutorialId, gradeInfo]
        )
        .object()
        .value()

    #
    # Same as above, but gets specific tutorial
    #
    $scope.reduceDataToTutorialWithId = (tutorial) ->
      $scope.reduceDataToTutorial()[tutorial.id]
)
