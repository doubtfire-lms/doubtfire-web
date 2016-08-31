angular.module('doubtfire.units.stats.unit-stats-download', [])

#
# Student's overall achievement statistics over the entire unit
#
.directive('unitStatsDownload', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/stats/unit-stats-download/unit-stats-download.tpl.html'
  scope:
    unit: "="
  controller: ($scope, TaskCompletionCsv) ->
    $scope.fetchTaskCompletionStats = () ->
      TaskCompletionCsv.downloadFile($scope.unit)
)
