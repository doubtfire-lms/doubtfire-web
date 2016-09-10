#
# Student's overall achievement statistics over the entire unit
#

mod = angular.module('doubtfire.units.stats.unit-stats-download', [])

.directive('unitStatsDownload', ->
  replace: true
  restrict: 'E'
  template: require('./unit-stats-download.tpl.html')
  scope:
    unit: "="
  controller: ($scope, TaskCompletionCsv) ->
    $scope.fetchTaskCompletionStats = () ->
      TaskCompletionCsv.downloadFile($scope.unit)
)

module.exports = mod.name
