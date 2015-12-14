angular.module('doubtfire.units.partials.unit-analytics', [])

.directive('unitAnalytics', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/unit-analytics.tpl.html'
  controller: ($scope, Unit) ->
    
    #
    # We need to avoid hitting the server with these requests unless this is actually viewed...
    # Store all analytics data in $scope.unit.analytics.
    #

    $scope.fetchTargetGradeStats = () ->
      Unit.targetGradeStats.query {id: $scope.unit.id},
        (response) ->
          $scope.unit.analytics.targetGradeStats = response

    $scope.fetchTaskStatusStats = () ->
      Unit.taskStatusCountByTutorial.get {id: $scope.unit.id},
        (response) ->
          $scope.unit.analytics.taskStatusCountByTutorial = response

)