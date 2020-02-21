angular.module('doubtfire.units.states.analytics.directives.unit-target-grade-stats', [])

#
# Summary stats for students and their desired target grade
# over the entire unit
#
.directive('unitTargetGradeStats', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/analytics/directives/unit-target-grade-stats/unit-target-grade-stats.tpl.html'
  scope:
    unit: "="
  controller: ($scope, $filter, Unit, taskService) ->
    $scope.overviewSelectors =
      tutorial: { text: 'Overview of tutorials', abbreviation: "ZZZ", id: -1 }

    $scope.tutorialsForSelector = []
    _.each $scope.unit.tutorials, (t) ->
      $scope.tutorialsForSelector.push {
        text: t.abbreviation + ' - ' + t.tutor.name
        id: t.id
        meeting_time: t.meeting_time
        tutor: t.tutor
        abbreviation: t.abbreviation
      }

    $scope.tutorialsForSelector.push $scope.overviewSelectors.tutorial

    $scope.switchToTutorial = (tutorial) ->
      $scope.dataModel.selectedType = 'tutorial'
      $scope.dataModel.selectedTask = null
      $scope.dataModel.selectedTutorial = tutorial
      $scope.depth = 0

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
      $scope.depth = 0
      return unless newValue?
      switch newValue
        when 'unit'
          $scope.data = $scope.reduceDataToOverall()
        when 'tutorial'
          $scope.dataModel.selectedTutorial = $scope.overviewSelectors.tutorial

    $scope.$watch 'dataModel.selectedTutorial', (newValue) ->
      return unless newValue?
      if newValue.id >= 0
        $scope.depth = 0
        $scope.data = $scope.reduceDataToTutorialWithId(newValue)
      else
        $scope.depth = 1
        $scope.data = $scope.reduceDataToTutorial()
        $scope.overviewKeys = _.map $scope.unit.tutorials, (t) ->
          {
            subtitle: "#{t.tutor.name} at #{$filter('date')(t.meeting_time, 'shortTime')}"
            title: t.abbreviation
            data: $scope.data[t.id]
            show: _.keys($scope.data[t.id]).length > 0
            tutorial: t
          }

    $scope.resetToOverview = ->
      switch $scope.dataModel.selectedType
        when 'unit'
          return
        when 'tutorial'
          $scope.dataModel.selectedTutorial = $scope.overviewSelectors.tutorial
       drillDown()

    $scope.drillDown = ->
      switch $scope.dataModel.selectedType
        when 'unit'
          $scope.dataModel.selectedType = 'tutorial'
        when 'tutorial'
          $scope.resetToOverview()

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
                                .map( (value) -> value.num )
                                .reduce(( (memo, num) -> num + memo ), 0)
                                .value()
          [gradeId, totalForThisGrade]
        )
        .fromPairs()
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
                        .fromPairs()
                        .value()
          [tutorialId, gradeInfo]
        )
        .fromPairs()
        .value()

    #
    # Same as above, but gets specific tutorial
    #
    $scope.reduceDataToTutorialWithId = (tutorial) ->
      $scope.reduceDataToTutorial()[tutorial.id]
)
