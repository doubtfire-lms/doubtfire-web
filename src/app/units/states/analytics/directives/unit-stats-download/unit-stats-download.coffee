angular.module('doubtfire.units.states.analytics.directives.unit-stats-download', [])

#
# Student's overall achievement statistics over the entire unit
#
.directive('unitStatsDownload', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/states/analytics/directives/unit-stats-download/unit-stats-download.tpl.html'
  scope:
    unit: "="
  controller: ($scope) ->
    $scope.fetchTaskCompletionStats = ->
      $scope.unit.downloadTaskCompletionCsv()
    $scope.fetchTutorAssessmentStats = ->
      $scope.unit.downloadTutorAssessmentCsv()

)
